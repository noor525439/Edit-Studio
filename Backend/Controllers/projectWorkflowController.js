import mongoose from "mongoose";
import ProjectOrder from "../models/ProjectOrderModel.js";
import Task from "../models/TaskModel.js";
import ProjectApplication from "../models/ProjectApplicationModel.js";
import Submission from "../models/SubmissionModel.js";
import Notification from "../models/NotificationModel.js";
import { User } from "../models/Usermodels.js";
import Editor from "../models/EditorModel.js";
import { emitToUsers } from "../utils/socket.js";
import { sendWorkflowEmail } from "../utils/workflowEmail.js";
import { logProjectActivity } from "../utils/projectActivity.js";
import Review from "../models/ReviewModel.js";

const CLIENT_ROLES = ["client", "freelancer"];

const isClientRole = (role) => CLIENT_ROLES.includes(String(role || "").toLowerCase());

const getCurrentUser = async (req, res) => {
  const currentUser = await User.findById(req.userId);
  if (!currentUser) {
    res.status(404).json({ success: false, message: "User not found" });
    return null;
  }
  return currentUser;
};

const createNotification = async ({ userId, type, title, message, orderId, io }) => {
  const notification = await Notification.create({
    userId,
    type,
    title,
    message,
    orderId: orderId || null,
  });

  if (io) {
    emitToUsers([String(userId)], "workflow:notification", {
      _id: notification._id,
      type,
      title,
      message,
      orderId,
      read: false,
      createdAt: notification.createdAt,
    });
  }

  return notification;
};

const notifyByEmail = async (userId, subject, message) => {
  const user = await User.findById(userId).select("email username");
  if (!user?.email) return;
  await sendWorkflowEmail({
    to: user.email,
    subject,
    html: `<p>Hi ${user.username || "there"},</p><p>${message}</p><p>— Edit Studio</p>`,
  });
};

export const getOrderById = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;

    const order = await ProjectOrder.findById(req.params.orderId)
      .populate("clientId", "username email role avatar")
      .populate("assignedEditorId", "username email role avatar");

    if (!order) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const role = String(currentUser.role).toLowerCase();
    const isOwner = String(order.clientId?._id || order.clientId) === String(currentUser._id);
    const isEditor =
      order.assignedEditorId &&
      String(order.assignedEditorId?._id || order.assignedEditorId) === String(currentUser._id);
    const isAdmin = role === "admin";
    const isOpenMarket =
      role === "editor" && order.status === "published" && !order.assignedEditorId;

    if (!isOwner && !isEditor && !isAdmin && !isOpenMarket) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const applications = await ProjectApplication.find({ orderId: order._id })
      .populate("editorId", "username email avatar")
      .sort({ createdAt: -1 });

    const submissions = await Submission.find({ orderId: order._id })
      .populate("editorId", "username")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: { order, applications, submissions },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const publishOrder = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;
    if (!isClientRole(currentUser.role)) {
      return res.status(403).json({ success: false, message: "Only clients can publish projects" });
    }

    const order = await ProjectOrder.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: "Project not found" });
    if (String(order.clientId) !== String(currentUser._id)) {
      return res.status(403).json({ success: false, message: "Not your project" });
    }

    order.status = "published";
    order.progressStage = "Video Pending";
    await order.save();

    await logProjectActivity({
      orderId: order._id,
      actorId: currentUser._id,
      actorName: currentUser.username,
      actorRole: currentUser.role,
      action: "project_published",
      details: `${currentUser.username} published "${order.projectTitle}"`,
    });

    const io = req.app.get("io");
    const editors = await User.find({ role: "editor", isApproved: true }).select("_id");
    await Promise.all(
      editors.map((ed) =>
        createNotification({
          userId: ed._id,
          type: "project_published",
          title: "New project available",
          message: `"${order.projectTitle}" is open for applications.`,
          orderId: order._id,
          io,
        })
      )
    );

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMarketplaceTasks = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;

    let orders = [];

    if (currentUser.role === "editor") {
      const published = await ProjectOrder.find({
        status: "published",
        assignedEditorId: null,
      })
        .populate("clientId", "username email avatar phone")
        .sort({ createdAt: -1 });

      const mine = await ProjectOrder.find({
        assignedEditorId: currentUser._id,
        status: { $nin: ["draft", "completed"] },
      })
        .populate("clientId", "username email avatar phone")
        .sort({ updatedAt: -1 });

      orders = [...mine, ...published];
    } else if (isClientRole(currentUser.role)) {
      orders = await ProjectOrder.find({ clientId: currentUser._id })
        .populate("assignedEditorId", "username email avatar")
        .sort({ createdAt: -1 });
    } else if (currentUser.role === "admin") {
      orders = await ProjectOrder.find()
        .populate("clientId", "username email")
        .populate("assignedEditorId", "username email")
        .sort({ createdAt: -1 });
    }

    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/** Assign editor from a pending application and start the project workflow. */
export const acceptApplication = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;
    if (!isClientRole(currentUser.role)) {
      return res.status(403).json({ success: false, message: "Only clients can accept applications" });
    }

    const { applicationId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({ success: false, message: "Invalid application" });
    }

    const application = await ProjectApplication.findById(applicationId).populate("editorId", "username email");
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    const order = await ProjectOrder.findById(application.orderId);
    if (!order) return res.status(404).json({ success: false, message: "Project not found" });
    if (String(order.clientId) !== String(currentUser._id)) {
      return res.status(403).json({ success: false, message: "Not your project" });
    }
    if (order.assignedEditorId) {
      return res.status(400).json({ success: false, message: "An editor is already assigned" });
    }
    if (application.status !== "pending") {
      return res.status(400).json({ success: false, message: "Application is no longer pending" });
    }

    const editorId = application.editorId._id || application.editorId;
    order.assignedEditorId = editorId;
    order.status = "project_started";
    order.hireType = "application";
    order.progressPercent = order.progressPercent || 0;
    await order.save();

    application.status = "accepted";
    await application.save();

    await ProjectApplication.updateMany(
      { orderId: order._id, _id: { $ne: application._id }, status: "pending" },
      { status: "rejected" }
    );

    const existingTask = await Task.findOne({ orderId: order._id, assignedEditorId: editorId });
    if (!existingTask) {
      await Task.create({
        orderId: order._id,
        assignedEditorId: editorId,
        assignedById: currentUser._id,
        title: order.projectTitle,
        details: application.message || "Application accepted — begin work on this project.",
        estimatedDuration: 120,
      });
    }

    const io = req.app.get("io");
    await createNotification({
      userId: editorId,
      type: "application_accepted",
      title: "Application accepted!",
      message: `${currentUser.username} accepted your application for "${order.projectTitle}".`,
      orderId: order._id,
      io,
    });
    await notifyByEmail(
      application.editorId?.email || (await User.findById(editorId))?.email,
      "Your application was accepted",
      `${currentUser.username} accepted your application for "${order.projectTitle}".`
    );

    await logProjectActivity({
      orderId: order._id,
      actorId: currentUser._id,
      actorName: currentUser.username,
      actorRole: currentUser.role,
      action: "editor_hired",
      details: `${currentUser.username} accepted ${application.editorId?.username || "editor"} via application`,
      meta: { editorId, applicationId: application._id },
    });

    const populated = await ProjectOrder.findById(order._id)
      .populate("clientId", "username email avatar phone")
      .populate("assignedEditorId", "username email avatar");

    return res.status(200).json({ success: true, data: populated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectApplication = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;
    if (!isClientRole(currentUser.role)) {
      return res.status(403).json({ success: false, message: "Only clients can reject applications" });
    }

    const { applicationId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({ success: false, message: "Invalid application" });
    }

    const application = await ProjectApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    const order = await ProjectOrder.findById(application.orderId);
    if (!order) return res.status(404).json({ success: false, message: "Project not found" });
    if (String(order.clientId) !== String(currentUser._id)) {
      return res.status(403).json({ success: false, message: "Not your project" });
    }
    if (application.status !== "pending") {
      return res.status(400).json({ success: false, message: "Application is no longer pending" });
    }

    application.status = "rejected";
    await application.save();

    const io = req.app.get("io");
    await createNotification({
      userId: application.editorId,
      type: "application_received",
      title: "Application update",
      message: `Your application for "${order.projectTitle}" was not selected.`,
      orderId: order._id,
      io,
    });

    return res.status(200).json({ success: true, data: application });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const applyForProject = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;
    if (currentUser.role !== "editor") {
      return res.status(403).json({ success: false, message: "Only editors can apply" });
    }

    const { orderId } = req.params;
    const { message } = req.body;

    const order = await ProjectOrder.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Project not found" });
    if (order.status !== "published" || order.assignedEditorId) {
      return res.status(400).json({ success: false, message: "Project is not open for applications" });
    }

    const application = await ProjectApplication.findOneAndUpdate(
      { orderId, editorId: currentUser._id },
      { message: message || "", status: "pending" },
      { upsert: true, new: true }
    );

    const io = req.app.get("io");
    await createNotification({
      userId: order.clientId,
      type: "application_received",
      title: "New editor application",
      message: `${currentUser.username} applied for "${order.projectTitle}".`,
      orderId: order._id,
      io,
    });
    await notifyByEmail(
      order.clientId,
      "New editor application",
      `${currentUser.username} applied for your project "${order.projectTitle}".`
    );

    await logProjectActivity({
      orderId: order._id,
      actorId: currentUser._id,
      actorName: currentUser.username,
      actorRole: currentUser.role,
      action: "application_submitted",
      details: `${currentUser.username} applied for this project`,
    });

    return res.status(201).json({ success: true, data: application });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "You already applied" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const instantHire = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;
    if (!isClientRole(currentUser.role)) {
      return res.status(403).json({ success: false, message: "Only clients can hire editors" });
    }

    const { editorId, orderId, paymentConfirmed } = req.body;
    if (!paymentConfirmed) {
      return res.status(400).json({ success: false, message: "Payment confirmation required" });
    }
    if (!mongoose.Types.ObjectId.isValid(editorId)) {
      return res.status(400).json({ success: false, message: "Invalid editor" });
    }

let editor;
let editorUserId;

// Check karein ke jo editorId aayi hai wo email hai ya ObjectId
const isEmail = String(editorId).includes('@');

if (isEmail) {
  // Agar galti se frontend se email aaya hai, toh User model mein email se dhoodhein
  editor = await User.findOne({ email: editorId, role: "editor", isApproved: true });
  if (editor) editorUserId = editor._id;
} else {
  // Agar valid ID aayi hai, toh normal flow chalayein
  const editorProfile = await Editor.findById(editorId);
  if (editorProfile?.userId) {
    editorUserId = editorProfile.userId;
  } else {
    editorUserId = editorId;
  }
  editor = await User.findOne({ _id: editorUserId, role: "editor", isApproved: true });
}

if (!editor) {
  return res.status(404).json({ success: false, message: "Editor not found or not approved" });
}

    let order;
    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
      order = await ProjectOrder.findById(orderId);
      if (!order) return res.status(404).json({ success: false, message: "Project not found" });
      if (String(order.clientId) !== String(currentUser._id)) {
        return res.status(403).json({ success: false, message: "Not your project" });
      }
    } else {
      order = await ProjectOrder.create({
        clientId: currentUser._id,
        projectTitle: `Instant hire — ${editor.username}`,
        videoType: "Other",
        videoDuration: "TBD",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        editingStyle: "Other",
        instructions: "Instant hire project — add project details from your dashboard.",
        rawFootageLink: "https://pending",
        revisionPolicyAgreed: true,
        status: "project_started",
        assignedEditorId: editor._id,
        hireType: "instant_hire",
        progressPercent: 0,
      });
    }

    order.assignedEditorId = editor._id;
    order.status = "project_started";
    order.hireType = "instant_hire";
    order.progressPercent = order.progressPercent || 0;
    if (order.status === "draft") order.status = "project_started";
    await order.save();

    await ProjectApplication.findOneAndUpdate(
      { orderId: order._id, editorId: editor._id },
      { status: "accepted" },
      { upsert: true }
    );

    const existingTask = await Task.findOne({ orderId: order._id, assignedEditorId: editor._id });
    if (!existingTask) {
      await Task.create({
        orderId: order._id,
        assignedEditorId: editor._id,
        assignedById: currentUser._id,
        title: order.projectTitle,
        details: "Instant hire assignment",
        estimatedDuration: 120,
      });
    }

    const io = req.app.get("io");
    await createNotification({
      userId: editor._id,
      type: "instant_hire",
      title: "You've been hired!",
      message: `${currentUser.username} hired you for "${order.projectTitle}".`,
      orderId: order._id,
      io,
    });
    await createNotification({
      userId: currentUser._id,
      type: "instant_hire",
      title: "Project started",
      message: `You hired ${editor.username} for "${order.projectTitle}".`,
      orderId: order._id,
      io,
    });

    await notifyByEmail(
      editor.email,
      "You've been hired on Edit Studio",
      `${currentUser.username} hired you for "${order.projectTitle}". Check your editor dashboard.`
    );
    await notifyByEmail(
      currentUser.email,
      "Project started on Edit Studio",
      `You hired ${editor.username} for "${order.projectTitle}".`
    );

    await logProjectActivity({
      orderId: order._id,
      actorId: currentUser._id,
      actorName: currentUser.username,
      actorRole: currentUser.role,
      action: "editor_hired",
      details: `${currentUser.username} hired ${editor.username} via instant hire`,
      meta: { editorId: editor._id },
    });

    const populated = await ProjectOrder.findById(order._id)
      .populate("clientId", "username email")
      .populate("assignedEditorId", "username email avatar");

    return res.status(200).json({ success: true, data: populated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProgressPercent = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;
    if (currentUser.role !== "editor") {
      return res.status(403).json({ success: false, message: "Only editors can update progress" });
    }

    const { progressPercent } = req.body;
    const percent = Math.min(100, Math.max(0, Number(progressPercent) || 0));

    const order = await ProjectOrder.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: "Project not found" });
    if (String(order.assignedEditorId) !== String(currentUser._id)) {
      return res.status(403).json({ success: false, message: "Not assigned to this project" });
    }

    order.progressPercent = percent;
    if (percent > 0 && order.status === "project_started") order.status = "in_progress";
    if (percent >= 100) order.status = "delivered";
    await order.save();

    const io = req.app.get("io");
    await createNotification({
      userId: order.clientId,
      type: "progress_updated",
      title: "Progress updated",
      message: `Your project "${order.projectTitle}" is now ${percent}% complete.`,
      orderId: order._id,
      io,
    });

    await logProjectActivity({
      orderId: order._id,
      actorId: currentUser._id,
      actorName: currentUser.username,
      actorRole: currentUser.role,
      action: "progress_updated",
      details: `Progress updated to ${percent}%`,
      meta: { progressPercent: percent },
    });

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createSubmission = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;
    if (currentUser.role !== "editor") {
      return res.status(403).json({ success: false, message: "Only editors can submit deliverables" });
    }

    const { orderId, fileUrl, fileName, notes } = req.body;
    const order = await ProjectOrder.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Project not found" });
    if (String(order.assignedEditorId) !== String(currentUser._id)) {
      return res.status(403).json({ success: false, message: "Not assigned to this project" });
    }

    const count = await Submission.countDocuments({ orderId });
    const submission = await Submission.create({
      orderId,
      editorId: currentUser._id,
      fileUrl,
      fileName: fileName || "",
      notes: notes || "",
      version: count + 1,
    });

    order.status = "delivered";
    order.progressPercent = 100;
    await order.save();

    const io = req.app.get("io");
    await createNotification({
      userId: order.clientId,
      type: "submission_received",
      title: "New delivery submitted",
      message: `Editor submitted work for "${order.projectTitle}".`,
      orderId: order._id,
      io,
    });
    await notifyByEmail(
      order.clientId,
      "New project delivery",
      `Your editor submitted deliverables for "${order.projectTitle}".`
    );

    await logProjectActivity({
      orderId: order._id,
      actorId: currentUser._id,
      actorName: currentUser.username,
      actorRole: currentUser.role,
      action: "submission_uploaded",
      details: `Editor submitted deliverable v${submission.version}`,
      meta: { fileName: submission.fileName },
    });

    return res.status(201).json({ success: true, data: submission });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSubmissions = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;

    let query = {};
    if (currentUser.role === "editor") {
      query.editorId = currentUser._id;
    } else if (isClientRole(currentUser.role)) {
      const myOrders = await ProjectOrder.find({ clientId: currentUser._id }).select("_id");
      query.orderId = { $in: myOrders.map((o) => o._id) };
    }

    const submissions = await Submission.find(query)
      .populate("orderId", "projectTitle status progressPercent")
      .populate("editorId", "username email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const requestRevision = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;
    if (!isClientRole(currentUser.role)) {
      return res.status(403).json({ success: false, message: "Only clients can request revisions" });
    }

    const { reason } = req.body;
    if (!reason?.trim()) {
      return res.status(400).json({ success: false, message: "Revision reason is required" });
    }

    const order = await ProjectOrder.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: "Project not found" });
    if (String(order.clientId) !== String(currentUser._id)) {
      return res.status(403).json({ success: false, message: "Not your project" });
    }

    order.status = "revision_requested";
    order.revisionReason = reason.trim();
    order.deliveryConfirmed = false;
    await order.save();

    const io = req.app.get("io");
    if (order.assignedEditorId) {
      await createNotification({
        userId: order.assignedEditorId,
        type: "revision_requested",
        title: "Revision requested",
        message: `Client requested changes on "${order.projectTitle}".`,
        orderId: order._id,
        io,
      });
      const editor = await User.findById(order.assignedEditorId).select("email");
      await notifyByEmail(
        editor?.email,
        "Revision requested",
        `Client requested revisions for "${order.projectTitle}": ${reason}`
      );
    }

    await logProjectActivity({
      orderId: order._id,
      actorId: currentUser._id,
      actorName: currentUser.username,
      actorRole: currentUser.role,
      action: "revision_requested",
      details: reason.trim(),
    });

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmDelivery = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;
    if (!isClientRole(currentUser.role)) {
      return res.status(403).json({ success: false, message: "Only clients can confirm delivery" });
    }

    const order = await ProjectOrder.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: "Project not found" });
    if (String(order.clientId) !== String(currentUser._id)) {
      return res.status(403).json({ success: false, message: "Not your project" });
    }

    order.deliveryConfirmed = true;
    order.status = "completed";
    order.progressStage = "Completed";
    await order.save();

    const io = req.app.get("io");
    if (order.assignedEditorId) {
      await createNotification({
        userId: order.assignedEditorId,
        type: "project_completed",
        title: "Project completed",
        message: `Client confirmed delivery for "${order.projectTitle}".`,
        orderId: order._id,
        io,
      });
      const editor = await User.findById(order.assignedEditorId).select("email");
      await notifyByEmail(
        editor?.email,
        "Project completed",
        `Client confirmed delivery for "${order.projectTitle}". Great work!`
      );
    }

    await createNotification({
      userId: currentUser._id,
      type: "project_completed",
      title: "Project completed",
      message: `You confirmed delivery for "${order.projectTitle}".`,
      orderId: order._id,
      io,
    });

    await logProjectActivity({
      orderId: order._id,
      actorId: currentUser._id,
      actorName: currentUser.username,
      actorRole: currentUser.role,
      action: "delivery_confirmed",
      details: "Client confirmed final delivery",
    });
    await logProjectActivity({
      orderId: order._id,
      actorId: currentUser._id,
      actorName: currentUser.username,
      actorRole: currentUser.role,
      action: "project_completed",
      details: "Project marked as completed",
    });

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const rateProject = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;
    if (!isClientRole(currentUser.role)) {
      return res.status(403).json({ success: false, message: "Only clients can rate projects" });
    }

    const { rating, reviewText, feedback } = req.body;
    const r = Number(rating);
    if (!r || r < 1 || r > 5) {
      return res.status(400).json({ success: false, message: "Rating must be 1–5" });
    }

    const order = await ProjectOrder.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: "Project not found" });
    if (String(order.clientId) !== String(currentUser._id)) {
      return res.status(403).json({ success: false, message: "Not your project" });
    }
    if (!order.assignedEditorId) {
      return res.status(400).json({ success: false, message: "No editor assigned" });
    }

    const text = (reviewText || feedback || "").trim();
    order.clientRating = r;
    order.clientReviewText = text;
    await order.save();

    const existing = await Review.findOne({ orderId: order._id });
    let review;
    if (existing) {
      existing.rating = r;
      existing.feedback = text;
      await existing.save();
      review = existing;
    } else {
      review = await Review.create({
        orderId: order._id,
        clientId: currentUser._id,
        editorId: order.assignedEditorId,
        rating: r,
        feedback: text,
      });
    }

    await logProjectActivity({
      orderId: order._id,
      actorId: currentUser._id,
      actorName: currentUser.username,
      actorRole: currentUser.role,
      action: "review_submitted",
      details: `${currentUser.username} rated ${r}/5 stars`,
      meta: { rating: r },
    });

    return res.status(200).json({ success: true, data: { order, review } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;

    const notifications = await Notification.find({ userId: currentUser._id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId: currentUser._id,
      read: false,
    });

    return res.status(200).json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;

    await Notification.updateOne(
      { _id: req.params.notificationId, userId: currentUser._id },
      { read: true }
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;

    await Notification.updateMany({ userId: currentUser._id, read: false }, { read: true });
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminUsers = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;
    if (currentUser.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin only" });
    }

    const users = await User.find()
      .select("username email role isApproved isVerified createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
