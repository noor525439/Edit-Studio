import mongoose from "mongoose";
import ProjectOrder from "../models/ProjectOrderModel.js";
import ProjectActivity from "../models/ProjectActivityModel.js";
import ProjectComment from "../models/ProjectCommentModel.js";
import Submission from "../models/SubmissionModel.js";
import ProjectApplication from "../models/ProjectApplicationModel.js";
import Review from "../models/ReviewModel.js";
import Editor from "../models/EditorModel.js";
import { User } from "../models/Usermodels.js";
import { logProjectActivity, buildOrderAttachments } from "../utils/projectActivity.js";

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

const getEditorStats = async (editorUserId) => {
  const reviews = await Review.find({ editorId: editorUserId });
  const avgRating = reviews.length
    ? Number((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1))
    : 0;
  const completedProjects = await ProjectOrder.countDocuments({
    assignedEditorId: editorUserId,
    status: "completed",
  });
  return {
    avgRating,
    totalReviews: reviews.length,
    completedProjects,
    isTopRated: avgRating >= 4.5 && reviews.length >= 3,
  };
};

export const getClientPublicProfile = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;

    const client = await User.findById(req.params.clientId).select(
      "username email avatar role isVerified createdAt"
    );
    if (!client || !isClientRole(client.role)) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }

    const projects = await ProjectOrder.find({ clientId: client._id })
      .select("projectTitle autoPriceEstimate status createdAt deadline clientRating")
      .sort({ createdAt: -1 });

    const completed = projects.filter((p) => p.status === "completed");
    const active = projects.filter((p) =>
      ["published", "project_started", "in_progress", "delivered", "revision_requested"].includes(p.status)
    );

    const totalSpent = completed.reduce((s, p) => s + Number(p.autoPriceEstimate || 0), 0);
    const ratedOrders = completed.filter((p) => p.clientRating);
    const avgRatingGiven = ratedOrders.length
      ? Number(
          (ratedOrders.reduce((s, p) => s + Number(p.clientRating || 0), 0) / ratedOrders.length).toFixed(1)
        )
      : 0;

    let trustBadge = "New Client";
    let trustLevel = "bronze";
    if (client.isVerified && completed.length >= 5 && avgRatingGiven >= 4) {
      trustBadge = "Trusted Partner";
      trustLevel = "gold";
    } else if (client.isVerified && completed.length >= 2) {
      trustBadge = "Verified Client";
      trustLevel = "silver";
    } else if (client.isVerified) {
      trustBadge = "Verified";
      trustLevel = "silver";
    }

    return res.status(200).json({
      success: true,
      data: {
        client,
        previousProjects: projects.map((p) => ({
          _id: p._id,
          title: p.projectTitle,
          date: p.createdAt,
          budget: p.autoPriceEstimate,
          status: p.status,
        })),
        budgetHistory: { totalSpent, projectCount: completed.length },
        avgRatingGiven,
        trustBadge,
        trustLevel,
        activeProjectsCount: active.length,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderDetail = async (req, res) => {
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

    const [applications, submissions, activity, comments] = await Promise.all([
      ProjectApplication.find({ orderId: order._id })
        .populate("editorId", "username email avatar")
        .sort({ createdAt: -1 }),
      Submission.find({ orderId: order._id }).populate("editorId", "username").sort({ createdAt: -1 }),
      ProjectActivity.find({ orderId: order._id }).sort({ createdAt: -1 }).limit(100),
      ProjectComment.find({ orderId: order._id })
        .populate("senderId", "username avatar role")
        .sort({ createdAt: 1 }),
    ]);

    let editorReview = null;
    if (order.assignedEditorId) {
      const eid = order.assignedEditorId._id || order.assignedEditorId;
      editorReview = await Review.findOne({ orderId: order._id, editorId: eid });
    }

    return res.status(200).json({
      success: true,
      data: {
        order,
        applications,
        submissions,
        activity,
        comments,
        attachments: buildOrderAttachments(order),
        editorReview,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addOrderComment = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;

    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: "Comment text is required" });
    }

    const order = await ProjectOrder.findById(req.params.orderId);
    if (!order) return res.status(404).json({ success: false, message: "Project not found" });

    const isOwner = String(order.clientId) === String(currentUser._id);
    const isEditor =
      order.assignedEditorId && String(order.assignedEditorId) === String(currentUser._id);
    if (!isOwner && !isEditor && currentUser.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const comment = await ProjectComment.create({
      orderId: order._id,
      senderId: currentUser._id,
      text: text.trim(),
    });
    await comment.populate("senderId", "username avatar role");

    await logProjectActivity({
      orderId: order._id,
      actorId: currentUser._id,
      actorName: currentUser.username,
      actorRole: currentUser.role,
      action: "comment_added",
      details: `${currentUser.username} left a comment`,
    });

    return res.status(201).json({ success: true, data: comment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const browseEditors = async (req, res) => {
  try {
    const editors = await Editor.find().lean();
    const enriched = await Promise.all(
      editors.map(async (ed) => {
        const userId = ed.userId;
        const stats = await getEditorStats(userId);
        const user = await User.findById(userId).select("username avatar isApproved");
        return {
          ...ed,
          userId,
          username: user?.username,
          avatar: user?.avatar,
          isApproved: user?.isApproved,
          ...stats,
        };
      })
    );

    enriched.sort((a, b) => {
      if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
      return b.totalReviews - a.totalReviews;
    });

    return res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicEditorProfile = async (req, res) => {
  try {
    const { editorId } = req.params;
    let editorProfile = null;
    let editorUserId = editorId;

    if (mongoose.Types.ObjectId.isValid(editorId)) {
      editorProfile = await Editor.findById(editorId);
      if (editorProfile) editorUserId = editorProfile.userId;
      else {
        editorProfile = await Editor.findOne({ userId: editorId });
        if (editorProfile) editorUserId = editorProfile.userId;
      }
    }

    if (!editorProfile) {
      editorProfile = await Editor.findOne({ userId: editorId });
    }
    if (!editorProfile) {
      return res.status(404).json({ success: false, message: "Editor not found" });
    }

    const user = await User.findById(editorUserId).select("username avatar role isApproved");
    const stats = await getEditorStats(editorUserId);
    const reviews = await Review.find({ editorId: editorUserId })
      .populate("clientId", "username avatar")
      .populate("orderId", "projectTitle")
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({
      success: true,
      data: {
        editorProfile,
        user,
        stats,
        reviews,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const submitOrderReview = async (req, res) => {
  try {
    const currentUser = await getCurrentUser(req, res);
    if (!currentUser) return;
    if (!isClientRole(currentUser.role)) {
      return res.status(403).json({ success: false, message: "Only clients can submit reviews" });
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
    if (order.status !== "completed" && !order.deliveryConfirmed) {
      return res.status(400).json({ success: false, message: "Project must be completed before reviewing" });
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
      details: `${currentUser.username} rated the editor ${r}/5 stars`,
      meta: { rating: r },
    });

    return res.status(200).json({ success: true, data: { order, review } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
