import mongoose from "mongoose";
import Stripe from "stripe";
import Editor from "../models/EditorModel.js";
import ProjectOrder, { progressStages } from "../models/ProjectOrderModel.js";
import Task from "../models/TaskModel.js";
import ChatThread from "../models/ChatThreadModel.js";
import Payment from "../models/PaymentModel.js";
import Review from "../models/ReviewModel.js";
import { User } from "../models/Usermodels.js";
import { calculatePaymentSplit } from "../utils/payment.js";
import { emitToUsers } from "../utils/socket.js";



let stripe = null;
const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Missing STRIPE_SECRET_KEY in environment");
  }
  if (!stripe) stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripe;
};

const parseLinks = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) return input.filter(Boolean);
  return String(input)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeRole = (role) => String(role || "").toLowerCase();

const getLastReadTime = (thread, userId) => {
  const uid = String(userId);
  const map = thread.lastReadAtByUser;
  if (!map) return null;
  if (map instanceof Map) return map.get(uid) || null;
  return map.get?.(uid) || map[uid] || null;
};

const countUnreadForUser = (thread, userId) => {
  const uid = String(userId);
  const lastRead = getLastReadTime(thread, uid);
  const threshold = lastRead ? new Date(lastRead).getTime() : 0;
  return (thread.messages || []).filter((m) => {
    if (m.deletedAt) return false;
    const sid = String(m.senderId?._id || m.senderId);
    if (sid === uid) return false;
    return new Date(m.createdAt).getTime() > threshold;
  }).length;
};

const getCurrentUser = async (req, res) => {
  const currentUser = await User.findById(req.userId);
  if (!currentUser) {
    res.status(404).json({ success: false, message: "User not found" });
    return null;
  }
  return currentUser;
};

export const createOrder = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;

    const {
      assignedEditorId,
      projectTitle,
      videoType,
      videoDuration,
      deadline,
      editingStyle,
      editingStyleOther,
      requirements,
      instructions,
      rawFootageLink,
      voiceoverLink,
      musicLinks,
      scriptLink,
      referenceLinks,
      revisionPolicyAgreed,
      priorityLevel,
      autoPriceEstimate,
    } = req.body;

    if (!projectTitle?.trim()) {
      return res.status(400).json({ success: false, message: "Project title is required" });
    }
    if (!videoDuration?.trim()) {
      return res.status(400).json({ success: false, message: "Video duration is required" });
    }
    if (!deadline) {
      return res.status(400).json({ success: false, message: "Deadline is required" });
    }
    if (!instructions?.trim()) {
      return res.status(400).json({ success: false, message: "Instructions are required" });
    }
    if (!rawFootageLink?.trim()) {
      return res.status(400).json({ success: false, message: "Raw footage link is required" });
    }
    if (!revisionPolicyAgreed) {
      return res.status(400).json({ success: false, message: "Revision policy must be agreed" });
    }

    const createdOrder = await ProjectOrder.create({
      clientId: currentUser._id,
      assignedEditorId: assignedEditorId || null,
      projectTitle,
      videoType,
      videoDuration,
      deadline,
      editingStyle,
      editingStyleOther: editingStyleOther || "",
      requirements: parseLinks(requirements),
      instructions,
      rawFootageLink,
      voiceoverLink: voiceoverLink || "",
      musicLinks: parseLinks(musicLinks),
      scriptLink: scriptLink || "",
      referenceLinks: parseLinks(referenceLinks),
      revisionPolicyAgreed: Boolean(revisionPolicyAgreed),
      priorityLevel: priorityLevel || "Normal",
      autoPriceEstimate: Number(autoPriceEstimate || 0),
      status: "draft",
      progressPercent: 0,
    });

    const { logProjectActivity: logCreate } = await import("../utils/projectActivity.js");
    await logCreate({
      orderId: createdOrder._id,
      actorId: currentUser._id,
      actorName: currentUser.username,
      actorRole: currentUser.role,
      action: "project_created",
      details: `Created project "${createdOrder.projectTitle}"`,
    });

    return res.status(201).json({ success: true, data: createdOrder });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;

    let query = {};
    const role = normalizeRole(currentUser.role);
    if (role === "editor") {
      query = { assignedEditorId: currentUser._id };
    } else if (role !== "admin") {
      query = { clientId: currentUser._id };
    }

    const orders = await ProjectOrder.find(query)
      .populate("clientId", "username email role")
      .populate("assignedEditorId", "username email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: orders, progressStages });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrderProgress = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;

    const { orderId } = req.params;
    const { progressStage, assignedEditorId } = req.body;

    if (!progressStages.includes(progressStage)) {
      return res.status(400).json({ success: false, message: "Invalid progress stage" });
    }

    const order = await ProjectOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const isAdmin = normalizeRole(currentUser.role) === "admin";
    const isAssignedEditor =
      order.assignedEditorId && String(order.assignedEditorId) === String(currentUser._id);

    if (!isAdmin && !isAssignedEditor) {
      return res.status(403).json({
        success: false,
        message: "Only the assigned editor or an admin can change project progress",
      });
    }

    order.progressStage = progressStage;
    if (assignedEditorId && mongoose.Types.ObjectId.isValid(assignedEditorId)) {
      order.assignedEditorId = assignedEditorId;
    }
    await order.save();

    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

/** Compute live elapsed seconds and whether the countdown has expired. */
const getTaskTimerState = (task) => {
  const estimatedSecs = (task.estimatedDuration || 60) * 60;
  let elapsed = task.elapsedSeconds || 0;
  if (task.timerStatus === "running" && task.startedAt) {
    elapsed += Math.floor((Date.now() - new Date(task.startedAt).getTime()) / 1000);
  }
  const remainingSeconds = Math.max(0, estimatedSecs - elapsed);
  const isOverdue = task.timerStatus !== "completed" && elapsed >= estimatedSecs;
  return { elapsed, remainingSeconds, isOverdue };
};

const enrichTask = (task) => {
  const doc = task.toObject ? task.toObject() : { ...task };
  const { elapsed, remainingSeconds, isOverdue } = getTaskTimerState(doc);
  doc.liveElapsedSeconds = elapsed;
  doc.remainingSeconds = remainingSeconds;
  doc.isOverdueLive = isOverdue;
  if (isOverdue && doc.timerStatus === "running") doc.isOverdue = true;
  return doc;
};

export const createTask = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;

    const { orderId, assignedEditorId, title, details, estimatedDuration } = req.body;
    if (!orderId || !title?.trim()) {
      return res.status(400).json({ success: false, message: "orderId and title are required" });
    }

    const order = await ProjectOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const role = normalizeRole(currentUser.role);
    const isAdmin = role === "admin";
    const isClient = String(order.clientId) === String(currentUser._id);
    const isAssignedEditor =
      role === "editor" &&
      order.assignedEditorId &&
      String(order.assignedEditorId) === String(currentUser._id);

    if (!isAdmin && !isClient && !isAssignedEditor) {
      return res.status(403).json({ success: false, message: "Not allowed to create tasks for this project" });
    }

    const editorId = isAssignedEditor
      ? currentUser._id
      : assignedEditorId || order.assignedEditorId;
    if (!editorId) {
      return res.status(400).json({ success: false, message: "No editor assigned to this project" });
    }

    const duration = Math.max(1, Number(estimatedDuration) || 60);

    const task = await Task.create({
      orderId,
      assignedEditorId: editorId,
      assignedById: currentUser._id,
      title: title.trim(),
      details: details || "",
      estimatedDuration: duration,
    });

    return res.status(201).json({ success: true, data: enrichTask(task) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;

    const { orderId } = req.query;
    let query = {};
    if (orderId) query.orderId = orderId;
    if (currentUser.role === "editor") query.assignedEditorId = currentUser._id;
    if (currentUser.role !== "admin" && currentUser.role !== "editor") {
      const myOrders = await ProjectOrder.find({ clientId: currentUser._id }).select("_id");
      query.orderId = { $in: myOrders.map((order) => order._id) };
    }

    const tasks = await Task.find(query)
      .populate("assignedEditorId", "username email avatar")
      .populate("orderId", "projectTitle progressStage status")
      .sort({ createdAt: -1 });

    // Sync overdue flag for running tasks
    await Promise.all(
      tasks.map(async (t) => {
        const { isOverdue } = getTaskTimerState(t);
        if (isOverdue && !t.isOverdue && t.timerStatus !== "completed") {
          t.isOverdue = true;
          await t.save();
        }
      })
    );

    return res.status(200).json({ success: true, data: tasks.map(enrichTask) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTaskTimer = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;

    const { taskId } = req.params;
    const { action } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const isAssignee = String(task.assignedEditorId) === String(currentUser._id);
    if (!isAssignee) {
      return res.status(403).json({ success: false, message: "Only the assigned editor can change the timer" });
    }

    const now = new Date();
    if (action === "start") {
      if (task.timerStatus !== "running") {
        task.startedAt = now;
        task.timerStatus = "running";
      }
    } else if (action === "pause") {
      if (task.timerStatus === "running" && task.startedAt) {
        task.elapsedSeconds += Math.floor((now.getTime() - task.startedAt.getTime()) / 1000);
        task.startedAt = null;
        task.timerStatus = "paused";
      }
    } else if (action === "complete") {
      if (task.timerStatus === "running" && task.startedAt) {
        task.elapsedSeconds += Math.floor((now.getTime() - task.startedAt.getTime()) / 1000);
      }
      task.startedAt = null;
      task.completedAt = now;
      task.timerStatus = "completed";
      const { isOverdue } = getTaskTimerState(task);
      task.isOverdue = isOverdue;
    } else {
      return res.status(400).json({ success: false, message: "Invalid action. Use start/pause/complete" });
    }

    // Mark overdue while timer is running past estimate
    if (task.timerStatus === "running") {
      const { isOverdue } = getTaskTimerState(task);
      if (isOverdue) task.isOverdue = true;
    }

    await task.save();
    return res.status(200).json({ success: true, data: enrichTask(task) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createOrGetThread = async (req, res) => {
  try {
    const { participantIds } = req.body;
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;

    const uniqueParticipantIds = [...new Set([req.userId, ...(participantIds || [])])];
    if (uniqueParticipantIds.length < 2) {
      return res.status(400).json({ success: false, message: "At least two participants are required" });
    }

    let thread = await ChatThread.findOne({
      participantIds: { $all: uniqueParticipantIds, $size: uniqueParticipantIds.length },
    });
    if (!thread) {
      thread = await ChatThread.create({ participantIds: uniqueParticipantIds, messages: [] });
    }

    return res.status(200).json({ success: true, data: thread });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { threadId } = req.params;
    const { text, attachments } = req.body;

    const thread = await ChatThread.findById(threadId);
    if (!thread) return res.status(404).json({ success: false, message: "Thread not found" });
    const isParticipant = thread.participantIds.some((id) => String(id) === String(req.userId));
    if (!isParticipant) return res.status(403).json({ success: false, message: "Not allowed in this thread" });

    const trimmed = String(text || "").trim();
    const rawAtt = Array.isArray(attachments) ? attachments : [];
    const normalizedAttachments = rawAtt
      .filter((a) => a && a.url && ["image", "video"].includes(a.mediaType))
      .map((a) => ({
        url: String(a.url).trim(),
        mediaType: a.mediaType,
        thumbnailUrl: String(a.thumbnailUrl || "").trim(),
      }));

    if (!trimmed && normalizedAttachments.length === 0) {
      return res.status(400).json({ success: false, message: "Message text or at least one attachment is required" });
    }

    thread.messages.push({
      senderId: req.userId,
      text: trimmed,
      attachments: normalizedAttachments,
    });
    await thread.save();

    const lastMessage = thread.messages[thread.messages.length - 1];
    await thread.populate("messages.senderId", "username role avatar");

    emitToUsers(
      thread.participantIds.map((id) => String(id)),
      "chat:new-message",
      {
        threadId: thread._id,
        message: {
          _id: lastMessage._id,
          senderId: {
            _id: req.userId,
            username: lastMessage.senderId?.username || "",
            role: lastMessage.senderId?.role || "",
            avatar: lastMessage.senderId?.avatar || "",
          },
          text: lastMessage.text,
          attachments: lastMessage.attachments || [],
          createdAt: lastMessage.createdAt,
        },
      }
    );

    return res.status(201).json({ success: true, data: thread });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyThreads = async (req, res) => {
  try {
    const threads = await ChatThread.find({ participantIds: req.userId })
      .populate("participantIds", "username email role avatar")
      .populate("messages.senderId", "username role avatar")
      .sort({ updatedAt: -1 });

    const payload = threads.map((t) => {
      const obj = t.toObject ? t.toObject() : t;
      return {
        ...obj,
        unreadCount: countUnreadForUser(t, req.userId),
      };
    });

    return res.status(200).json({ success: true, data: payload });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markThreadRead = async (req, res) => {
  try {
    const { threadId } = req.params;
    const thread = await ChatThread.findById(threadId);
    if (!thread) return res.status(404).json({ success: false, message: "Thread not found" });
    const isParticipant = thread.participantIds.some((id) => String(id) === String(req.userId));
    if (!isParticipant) return res.status(403).json({ success: false, message: "Not allowed in this thread" });

    if (!thread.lastReadAtByUser) thread.lastReadAtByUser = new Map();
    thread.lastReadAtByUser.set(String(req.userId), new Date());
    thread.markModified("lastReadAtByUser");
    await thread.save();

    emitToUsers([String(req.userId)], "chat:thread-read", { threadId: thread._id });

    return res.status(200).json({ success: true, data: { threadId: thread._id } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { threadId, messageId } = req.params;
    const { text } = req.body;
    const thread = await ChatThread.findById(threadId);
    if (!thread) return res.status(404).json({ success: false, message: "Thread not found" });
    const isParticipant = thread.participantIds.some((id) => String(id) === String(req.userId));
    if (!isParticipant) return res.status(403).json({ success: false, message: "Not allowed in this thread" });

    const msg = thread.messages.id(messageId);
    if (!msg) return res.status(404).json({ success: false, message: "Message not found" });
    if (String(msg.senderId) !== String(req.userId)) {
      return res.status(403).json({ success: false, message: "You can only edit your own messages" });
    }
    if (msg.deletedAt) return res.status(400).json({ success: false, message: "Deleted messages cannot be edited" });

    const next = String(text || "").trim();
    const existingAttachments = msg.attachments || [];
    if (!next && existingAttachments.length === 0) {
      return res.status(400).json({ success: false, message: "Text cannot be empty unless attachments exist" });
    }
    msg.text = next;
    msg.editedAt = new Date();
    await thread.save();
    await thread.populate("messages.senderId", "username role avatar");

    emitToUsers(
      thread.participantIds.map((id) => String(id)),
      "chat:message-updated",
      { threadId: thread._id, messageId: msg._id }
    );

    return res.status(200).json({ success: true, data: thread });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { threadId, messageId } = req.params;
    const thread = await ChatThread.findById(threadId);
    if (!thread) return res.status(404).json({ success: false, message: "Thread not found" });
    const isParticipant = thread.participantIds.some((id) => String(id) === String(req.userId));
    if (!isParticipant) return res.status(403).json({ success: false, message: "Not allowed in this thread" });

    const msg = thread.messages.id(messageId);
    if (!msg) return res.status(404).json({ success: false, message: "Message not found" });
    if (String(msg.senderId) !== String(req.userId)) {
      return res.status(403).json({ success: false, message: "You can only delete your own messages" });
    }

    msg.deletedAt = new Date();
    msg.text = "";
    msg.attachments = [];
    await thread.save();

    emitToUsers(
      thread.participantIds.map((id) => String(id)),
      "chat:message-updated",
      { threadId: thread._id, messageId: msg._id }
    );

    return res.status(200).json({ success: true, data: thread });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const emitPaymentNotification = (io, payment, order, clientName) => {
  if (!io) return;
  io.emit("payment_received", {
    paymentId: payment._id,
    amount: payment.totalAmount,
    projectTitle: order?.projectTitle || "Project",
    editorId: order?.assignedEditorId,
    clientName: clientName || "Client",
    status: payment.status,
  });
};

export const createPaymentIntent = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;

    const { orderId, totalAmount } = req.body;
    if (!orderId || !totalAmount) {
      return res.status(400).json({ success: false, message: "orderId and totalAmount are required" });
    }
    const numericAmount = Number(totalAmount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: "totalAmount must be a positive number" });
    }

    const order = await ProjectOrder.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const amountInPaisa = Math.round(numericAmount * 100);

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: amountInPaisa,
      currency: "pkr",
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: orderId.toString(),
        clientId: currentUser._id.toString(),
        projectTitle: order.projectTitle || "",
      },
    });

    const split = calculatePaymentSplit(numericAmount, 20);
    const payment = await Payment.create({
      orderId,
      clientId: currentUser._id,
      editorId: order.assignedEditorId || null,
      stripePaymentIntentId: paymentIntent.id,
      totalAmount: split.totalAmount,
      adminCommissionPercent: split.adminCommissionPercent,
      adminCommissionAmount: split.adminCommissionAmount,
      editorPayoutAmount: split.editorPayoutAmount,
      method: "stripe_card",
      status: "completed",
    });

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createCheckoutSession = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;

    const { orderId, totalAmount } = req.body;
    if (!orderId || !totalAmount) {
      return res.status(400).json({ success: false, message: "orderId and totalAmount are required" });
    }
    const numericAmount = Number(totalAmount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: "totalAmount must be a positive number" });
    }

    const order = await ProjectOrder.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const amountInPaisa = Math.round(numericAmount * 100);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "pkr",
            product_data: {
              name: order.projectTitle || "Project Payment",
              description: `Payment for order #${orderId}`,
            },
            unit_amount: amountInPaisa,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${frontendUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/payment-cancel`,
      metadata: {
        orderId: orderId.toString(),
        clientId: currentUser._id.toString(),
      },
    });

    const split = calculatePaymentSplit(numericAmount, 20);
    await Payment.create({
  orderId,
  clientId: currentUser._id,
  editorId: order.assignedEditorId || null,
  stripeCheckoutSessionId: session.id,
  totalAmount: split.totalAmount,
  adminCommissionPercent: split.adminCommissionPercent,
  adminCommissionAmount: split.adminCommissionAmount,
  editorPayoutAmount: split.editorPayoutAmount,
  method: "stripe_checkout",
  status: "pending", 
});

    return res.status(200).json({ success: true, url: session.url });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = getStripe().webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Stripe webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const io = req.app.get("socketio");

    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object;
        const payment = await Payment.findOneAndUpdate(
          { stripePaymentIntentId: intent.id },
          {
            status: "completed",
            paidAt: new Date(),
            receiptUrl: intent.charges?.data?.[0]?.receipt_url || null,
          },
          { new: true }
        );

        if (payment) {
          const adminUser = await User.findOne({ role: "admin" }).sort({ createdAt: 1 });
          if (adminUser) {
            await User.updateOne(
              { _id: adminUser._id },
              { $inc: { adminWalletBalance: payment.adminCommissionAmount } }
            );
          }
          if (payment.editorId) {
            await User.updateOne(
              { _id: payment.editorId },
              { $inc: { editorPendingBalance: payment.editorPayoutAmount } }
            );
          }

          const order = await ProjectOrder.findById(payment.orderId);
          const client = await User.findById(payment.clientId).select("username");
          emitPaymentNotification(io, payment, order, client?.username);
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const intent = event.data.object;
        await Payment.findOneAndUpdate(
          { stripePaymentIntentId: intent.id },
          {
            status: "failed",
            failureReason: intent.last_payment_error?.message || "Payment failed",
          }
        );
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object;
        const payment = await Payment.findOneAndUpdate(
          { stripeCheckoutSessionId: session.id },
          {
            status: "completed",
            paidAt: new Date(),
            stripePaymentIntentId: session.payment_intent || null,
          },
          { new: true }
        );

        if (payment) {
          const adminUser = await User.findOne({ role: "admin" }).sort({ createdAt: 1 });
          if (adminUser) {
            await User.updateOne(
              { _id: adminUser._id },
              { $inc: { adminWalletBalance: payment.adminCommissionAmount } }
            );
          }
          if (payment.editorId) {
            await User.updateOne(
              { _id: payment.editorId },
              { $inc: { editorPendingBalance: payment.editorPayoutAmount } }
            );
          }

          const order = await ProjectOrder.findById(payment.orderId);
          const client = await User.findById(payment.clientId).select("username");
          emitPaymentNotification(io, payment, order, client?.username);
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object;
        await Payment.findOneAndUpdate(
          { stripeCheckoutSessionId: session.id },
          { status: "cancelled" }
        );
        break;
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return res.status(500).json({ success: false, message: "Webhook processing failed" });
  }
};

export const getPayments = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;

    let query = {};
    const role = normalizeRole(currentUser.role); 
    if (role === "editor") query.editorId = currentUser._id;
    else if (role !== "admin") query.clientId = currentUser._id;

    const payments = await Payment.find(query)
      .populate("clientId", "username email")
      .populate("editorId", "username email")
      .populate("orderId", "projectTitle")
      .sort({ createdAt: -1 });

    // Deleted the duplicate line that was here
    const data = payments.map((doc) => {
      const o = doc.toObject ? doc.toObject() : { ...doc };
      if (role === "editor") {
        delete o.adminCommissionAmount;
        delete o.adminCommissionPercent;
      }
      return o;
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
export const refundPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    if (payment.status !== "completed") {
      return res.status(400).json({ success: false, message: "Only completed payments can be refunded" });
    }
    if (!payment.stripePaymentIntentId) {
      return res.status(400).json({ success: false, message: "No Stripe payment intent found" });
    }

    const refund = await getStripe().refunds.create({ payment_intent: payment.stripePaymentIntentId });

    payment.status = "refunded";
    await payment.save();

    const adminUser = await User.findOne({ role: "admin" }).sort({ createdAt: 1 });
    if (adminUser) {
      await User.updateOne(
        { _id: adminUser._id },
        { $inc: { adminWalletBalance: -payment.adminCommissionAmount } }
      );
    }
    if (payment.editorId) {
      await User.updateOne(
        { _id: payment.editorId },
        { $inc: { editorPendingBalance: -payment.editorPayoutAmount } }
      );
    }

    return res.status(200).json({ success: true, data: payment, refund });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const approvePaymentManual = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser || normalizeRole(currentUser.role) !== "admin") {
      return res.status(403).json({ success: false, message: "Only admin can approve payments" });
    }

    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);

    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    if (payment.status === "completed") {
      return res.status(400).json({ success: false, message: "Payment already completed" });
    }

    payment.status = "completed";
    payment.paidAt = new Date();
    await payment.save();

    await User.updateOne(
      { role: "admin" },
      { $inc: { adminWalletBalance: payment.adminCommissionAmount } }
    );

    if (payment.editorId) {
      await User.updateOne(
        { _id: payment.editorId },
        { $inc: { editorPendingBalance: payment.editorPayoutAmount } }
      );
    }

    const io = req.app.get("socketio");
    const order = await ProjectOrder.findById(payment.orderId);
    emitPaymentNotification(io, payment, order, "Manual Admin Approval");

    return res.status(200).json({ success: true, message: "Payment approved successfully", data: payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;

    const { orderId, editorId, rating, feedback } = req.body;
    const order = await ProjectOrder.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (String(order.clientId) !== String(currentUser._id)) {
      return res.status(403).json({ success: false, message: "Only the client for this order can submit a review" });
    }

    const review = await Review.create({
      orderId,
      clientId: currentUser._id,
      editorId,
      rating: Number(rating),
      feedback: feedback || "",
    });

    return res.status(201).json({ success: true, data: review });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getEditorGigProfile = async (req, res) => {
  try {
    const { editorUserId } = req.params;
    const editorProfile = await Editor.findOne({ userId: editorUserId });
    if (!editorProfile) {
      return res.status(404).json({ success: false, message: "Editor profile not found" });
    }

    const reviews = await Review.find({ editorId: editorUserId });
    const avgRating = reviews.length
      ? Number((reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length).toFixed(1))
      : 0;

    const completedTasks = await ProjectOrder.countDocuments({
      assignedEditorId: editorUserId,
      status: "completed",
    });

    const completedWithTime = await Task.find({
      assignedEditorId: editorUserId,
      timerStatus: "completed",
    }).select("elapsedSeconds");

    const durations = completedWithTime
      .map((t) => Number(t.elapsedSeconds || 0))
      .filter((n) => n > 0);
    const avgCompletionSeconds = durations.length
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        editorProfile,
        avgRating,
        completedTasks,
        totalReviews: reviews.length,
        avgCompletionSeconds,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminChatMonitor = async (req, res) => {
  try {
    const threads = await ChatThread.find({})
      .populate("participantIds", "username role avatar email")
      .populate("messages.senderId", "username role avatar")
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, data: threads });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminCommissionOverview = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate("clientId", "username email")
      .populate("editorId", "username email")
      .populate("orderId", "projectTitle")
      .sort({ createdAt: -1 });

    const totals = payments.reduce(
      (acc, payment) => {
        acc.totalVolume += Number(payment.totalAmount || 0);
        acc.totalAdminCommission += Number(payment.adminCommissionAmount || 0);
        acc.totalEditorPayout += Number(payment.editorPayoutAmount || 0);
        return acc;
      },
      { totalVolume: 0, totalAdminCommission: 0, totalEditorPayout: 0 }
    );

    return res.status(200).json({
      success: true,
      data: {
        totals,
        payments,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getReviews = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;
 
    let query = {};
    if (currentUser.role === "editor") {
      query = { editorId: currentUser._id };
    } else if (currentUser.role === "client" || currentUser.role === "freelancer") {
      query = { clientId: currentUser._id };
    }

 
    const reviews = await Review.find(query)
      .populate("clientId", "username avatar")
      .populate("editorId", "username avatar")
      .populate("orderId", "projectTitle")
      .sort({ createdAt: -1 });
 
    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
