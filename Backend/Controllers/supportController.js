import SupportMessage from "../models/SupportMessageModel.js";
import { User } from "../models/Usermodels.js";
import { createNotifications } from "./notificationController.js";
import {
  sendSupportReplyEmail,
  sendNewSupportNotificationEmail,
} from "../EmailVerify/supportEmail.js";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const spamRegex =
  /(asdf+|qwerty|zxcvb+|qazwsx|keyboard mash|dwww+|swww+|fwww+|aaaa+|dddd+|ffff+|qqqq+)/i;

const looksLikeSpam = (text) => {
  if (!text) return false;
  const normalized = text.trim().toLowerCase();
  if (spamRegex.test(normalized)) return true;
  if (/([a-zA-Z])\1{4,}/.test(normalized)) return true;
  const letters = (normalized.match(/[a-zA-Z]/g) || []).length;
  const ratio = letters / Math.max(normalized.length, 1);
  return ratio < 0.35;
};

export const createSupportMessage = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const currentUser = await User.findById(userId).select(
      "role username email",
    );
    if (!currentUser) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid user session" });
    }

    const senderName = String(req.body.senderName || "").trim();
    const senderEmail = String(req.body.senderEmail || "")
      .trim()
      .toLowerCase();
    const subject = String(req.body.subject || "").trim();
    const message = String(req.body.message || "").trim();
    const senderRole = currentUser.role || "client";

    if (!senderName || !senderEmail || !subject || !message) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Full name, email, subject, and message are required.",
        });
    }

    if (!emailRegex.test(senderEmail)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide a valid email address.",
        });
    }

    if (senderName.length < 3) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Name should be at least 3 characters long.",
        });
    }

    if (subject.length < 10) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Subject should be at least 10 characters long.",
        });
    }

    if (message.length < 20) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Message should be at least 20 characters long.",
        });
    }

    if (looksLikeSpam(subject)) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Subject looks like spam. Please provide a clear subject.",
        });
    }

    if (looksLikeSpam(message)) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Message looks like spam or gibberish. Please provide a meaningful request.",
        });
    }

    const uploadedAttachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        const fileUrl =
          file.path || file.secure_url || file.url || file.location || "";
        uploadedAttachments.push({
          filename: file.originalname,
          fileUrl,
          fileType: file.mimetype,
          uploadedAt: new Date(),
        });
      });
    }

    const newSupportMessage = new SupportMessage({
      userId,
      senderName,
      senderEmail,
      senderRole,
      subject,
      message,
      attachments: uploadedAttachments,
      isReadByUser: true,
      isReadByAdmin: false,
    });

    await newSupportMessage.save();

    const socketServer = req.app.get("io");
    if (socketServer) {
      socketServer.to("admin_room").emit("new_support_message", {
        messageId: newSupportMessage._id,
        senderName,
        senderEmail,
        senderRole,
        subject,
        createdAt: newSupportMessage.createdAt,
      });
    }

    if (process.env.ADMIN_EMAIL) {
      sendNewSupportNotificationEmail(
        process.env.ADMIN_EMAIL,
        senderName,
        subject,
        message,
        uploadedAttachments,
      ).catch((err) => {
        console.error("Support notification email failed:", err);
      });
    }

    // Persist notifications for admins
    try {
      const admins = await User.find({ role: 'admin' }).select('_id');
      const adminIds = admins.map(a => a._id.toString());
      await createNotifications({
        app: req.app,
        recipients: adminIds,
        actorId: userId,
        type: 'support_message',
        title: `New support ticket: ${subject}`,
        message: `${senderName}: ${message.substring(0, 150)}`,
        link: `/admin/support/${newSupportMessage._id}`,
        relatedId: newSupportMessage._id,
      });
    } catch (nerr) {
      console.error('Notification creation failed:', nerr);
    }

    return res.status(201).json({
      success: true,
      message: "Support message sent successfully.",
      data: newSupportMessage,
    });
  } catch (error) {
    console.error("Error creating support message:", error);
    const status = error.name === "MulterError" ? 400 : 500;
    return res.status(status).json({
      success: false,
      message: error.message || "Failed to send support message",
    });
  }
};

export const getAllSupportMessages = async (req, res) => {
  try {
    const { status, priority, searchTerm, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    if (searchTerm) {
      filter.$or = [
        { senderName: { $regex: searchTerm, $options: "i" } },
        { senderEmail: { $regex: searchTerm, $options: "i" } },
        { subject: { $regex: searchTerm, $options: "i" } },
        { message: { $regex: searchTerm, $options: "i" } },
      ];
    }

    const total = await SupportMessage.countDocuments(filter);
    const messages = await SupportMessage.find(filter)
      .populate("userId", "firstName lastName email profilePicture")
      .populate("replies.replyBy", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching support messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch support messages",
      error: error.message,
    });
  }
};

export const getUserSupportMessages = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const total = await SupportMessage.countDocuments({ userId });
    const messages = await SupportMessage.find({ userId })
      .populate("replies.replyBy", "firstName lastName profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching user support messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your support messages",
      error: error.message,
    });
  }
};

export const getSupportMessageById = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user?.id;

    const message = await SupportMessage.findById(messageId)
      .populate("userId", "firstName lastName email profilePicture")
      .populate("replies.replyBy", "firstName lastName profilePicture");

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Support message not found",
      });
    }

    if (message.userId.toString() === userId) {
      message.isReadByUser = true;
      message.readReceiptTimestamp = new Date();
      await message.save();
    } else {
      message.isReadByAdmin = true;
      await message.save();
    }

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error fetching support message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch support message",
      error: error.message,
    });
  }
};

export const replySupportMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { replyMessage } = req.body;
    const adminId = req.userId || req.user?.id || req.user?._id;
    const adminRole = req.userRole || req.user?.role || "admin";
    console.log("adminId:", adminId, "adminRole:", adminRole);
    if (!replyMessage) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required",
      });
    }

    let uploadedAttachments = [];
    if (req.files && req.files.length > 0) {
      uploadedAttachments = req.files.map((file) => ({
        filename: file.originalname,
        fileUrl: file.path,
        fileType: file.mimetype,
      }));
    }

    const supportMessage = await SupportMessage.findByIdAndUpdate(
      messageId,
      {
        $push: {
          replies: {
            replyBy: adminId,
            replyByRole: adminRole,
            replyMessage,
            attachments: uploadedAttachments,
            replyedAt: new Date(),
            isRead: false,
          },
        },
        status: "in-progress",
        lastUpdatedBy: "admin",
        isReadByAdmin: true,
      },
      { new: true },
    )
      .populate("userId", "email")
      .populate("replies.replyBy", "firstName lastName email");

    if (supportMessage.senderEmail) {
      try {
        await sendSupportReplyEmail(
          supportMessage.senderEmail,
          supportMessage.senderName,
          replyMessage,
        );
      } catch (emailError) {
        console.error("Error sending reply email:", emailError);
      }
    }

    const socketServer = req.app.get("io");
    if (socketServer) {
      socketServer
        .to(`user_${supportMessage.userId}`)
        .emit("support_message_reply", {
          messageId,
          replyMessage,
          replyedAt: new Date(),
        });
    }

    // Create notification for client and linked editor (if present)
    try {
      const recipients = [String(supportMessage.userId)];
      // if supportMessage has editor or assigned user field, include them
      if (supportMessage.editorId) recipients.push(String(supportMessage.editorId));
      await createNotifications({
        app: req.app,
        recipients,
        actorId: adminId,
        type: 'support_reply',
        title: `Reply on your support ticket: ${supportMessage.subject}`,
        message: replyMessage.substring(0, 200),
        link: `/support/${messageId}`,
        relatedId: supportMessage._id,
      });
    } catch (nerr) {
      console.error('Failed creating reply notifications:', nerr);
    }

    res.status(200).json({
      success: true,
      message: "Reply sent successfully",
      data: supportMessage,
    });
  } catch (error) {
    console.error("Error replying to support message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send reply",
      error: error.message,
    });
  }
};

export const markAsReadByAdmin = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await SupportMessage.findByIdAndUpdate(
      messageId,
      {
        isReadByAdmin: true,
      },
      { new: true },
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Support message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Marked as read",
      data: message,
    });
  } catch (error) {
    console.error("Error marking as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update read status",
      error: error.message,
    });
  }
};

export const updateSupportMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status, priority } = req.body;

    const validStatuses = ["open", "in-progress", "resolved", "closed"];
    const validPriorities = ["low", "medium", "high", "urgent"];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority",
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    updateData.lastUpdatedBy = "admin";

    const message = await SupportMessage.findByIdAndUpdate(
      messageId,
      updateData,
      { new: true },
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Support message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: message,
    });
  } catch (error) {
    console.error("Error updating message status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update status",
      error: error.message,
    });
  }
};

export const getSupportStats = async (req, res) => {
  try {
    const total = await SupportMessage.countDocuments();
    const open = await SupportMessage.countDocuments({ status: "open" });
    const inProgress = await SupportMessage.countDocuments({
      status: "in-progress",
    });
    const resolved = await SupportMessage.countDocuments({
      status: "resolved",
    });
    const unread = await SupportMessage.countDocuments({
      isReadByAdmin: false,
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        open,
        inProgress,
        resolved,
        unread,
      },
    });
  } catch (error) {
    console.error("Error fetching support stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch support statistics",
      error: error.message,
    });
  }
};

export const replyByUser = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { message } = req.body;
    const userId = req.userId;

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const existing = await SupportMessage.findOne({
      _id: messageId,
      userId,
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    if (existing.status === "closed") {
      return res.status(400).json({
        success: false,
        message: "This ticket is closed",
      });
    }
    let uploadedAttachments = [];
    if (req.files && req.files.length > 0) {
      uploadedAttachments = req.files.map((file) => ({
        filename: file.originalname,
        fileUrl: file.path,
        fileType: file.mimetype,
      }));
    }
    const currentUser = await User.findById(userId).select("role");
    const updated = await SupportMessage.findByIdAndUpdate(
      messageId,
      {
        $push: {
          replies: {
            replyBy: userId,
            replyByRole: currentUser?.role || "client",
            replyMessage: message,
            attachments: uploadedAttachments,
            replyedAt: new Date(),
            isRead: false,
          },
        },
        isReadByAdmin: false,
        lastUpdatedBy: "client",
      },
      { new: true },
    )
      .populate("userId", "firstName lastName email profilePicture")
      .populate("replies.replyBy", "firstName lastName profilePicture");

    const socketServer = req.app.get("io");
    if (socketServer) {
      socketServer.to("admin_room").emit("support_message_reply", {
        messageId,
        replyMessage: message,
        replyedAt: new Date(),
      });
    }

    // Notify admins about user reply
    try {
      const admins = await User.find({ role: 'admin' }).select('_id');
      const adminIds = admins.map(a => a._id.toString());
      await createNotifications({
        app: req.app,
        recipients: adminIds,
        actorId: userId,
        type: 'support_reply',
        title: `New user reply on ticket: ${existing.subject}`,
        message: message.substring(0, 200),
        link: `/admin/support/${messageId}`,
        relatedId: existing._id,
      });
    } catch (nerr) {
      console.error('Admin notification failed:', nerr);
    }

    return res.status(200).json({
      success: true,
      message: "Reply sent successfully",
      data: updated,
    });
  } catch (error) {
    console.error("User reply error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send reply",
      error: error.message,
    });
  }
};
