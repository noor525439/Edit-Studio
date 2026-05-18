import SupportMessage from "../models/SupportMessageModel.js";
import {User} from "../models/Usermodels.js";
import { sendSupportReplyEmail } from "../EmailVerify/supportEmail.js";

export const createSupportMessage = async (req, res) => {
  try {
    const { senderName, senderEmail, senderRole, subject, message, attachments } = req.body;
    const userId = req.user?.id;

    if (!senderName || !senderEmail || !senderRole || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Process file uploads
    let uploadedAttachments = [];
    if (req.files && req.files.length > 0) {
      uploadedAttachments = req.files.map(file => ({
        filename: file.originalname,
        fileUrl: file.path, // Cloudinary URL
        fileType: file.mimetype,
        uploadedAt: new Date()
      }));
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
      isReadByAdmin: false
    });

    await newSupportMessage.save();

    // Emit socket event to notify admin
    const socketServer = req.app.get('io');
    if (socketServer) {
      socketServer.to('admin_room').emit('new_support_message', {
        messageId: newSupportMessage._id,
        senderName,
        senderEmail,
        senderRole,
        subject,
        createdAt: newSupportMessage.createdAt
      });
    }

    res.status(201).json({
      success: true,
      message: "Support message sent successfully",
      data: newSupportMessage
    });
  } catch (error) {
    console.error("Error creating support message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send support message",
      error: error.message
    });
  }
};

// Get all support messages (Admin only)
export const getAllSupportMessages = async (req, res) => {
  try {
    const { status, priority, searchTerm, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    if (searchTerm) {
      filter.$or = [
        { senderName: { $regex: searchTerm, $options: 'i' } },
        { senderEmail: { $regex: searchTerm, $options: 'i' } },
        { subject: { $regex: searchTerm, $options: 'i' } },
        { message: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    const total = await SupportMessage.countDocuments(filter);
    const messages = await SupportMessage.find(filter)
      .populate('userId', 'firstName lastName email profilePicture')
      .populate('replies.replyBy', 'firstName lastName profilePicture')
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
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching support messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch support messages",
      error: error.message
    });
  }
};

// Get user's own support messages
export const getUserSupportMessages = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const total = await SupportMessage.countDocuments({ userId });
    const messages = await SupportMessage.find({ userId })
      .populate('replies.replyBy', 'firstName lastName profilePicture')
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
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching user support messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your support messages",
      error: error.message
    });
  }
};

// Get single support message by ID
export const getSupportMessageById = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user?.id;

    const message = await SupportMessage.findById(messageId)
      .populate('userId', 'firstName lastName email profilePicture')
      .populate('replies.replyBy', 'firstName lastName profilePicture');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Support message not found"
      });
    }

    // Update read receipt
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
      data: message
    });
  } catch (error) {
    console.error("Error fetching support message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch support message",
      error: error.message
    });
  }
};

// Reply to support message (Admin only)
export const replySupportMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { replyMessage } = req.body;
    const adminId = req.user?.id;
    const adminRole = req.user?.role;

    if (!replyMessage) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required"
      });
    }

    // Process file uploads
    let uploadedAttachments = [];
    if (req.files && req.files.length > 0) {
      uploadedAttachments = req.files.map(file => ({
        filename: file.originalname,
        fileUrl: file.path, // Cloudinary URL
        fileType: file.mimetype
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
            isRead: false
          }
        },
        status: 'in-progress',
        lastUpdatedBy: 'admin',
        isReadByAdmin: true
      },
      { new: true }
    ).populate('userId', 'email')
      .populate('replies.replyBy', 'firstName lastName email');

    // Send email notification
    if (supportMessage.senderEmail) {
      try {
        await sendSupportReplyEmail(
          supportMessage.senderEmail,
          supportMessage.senderName,
          replyMessage
        );
      } catch (emailError) {
        console.error("Error sending reply email:", emailError);
      }
    }

    // Emit socket event to notify user
    const socketServer = req.app.get('io');
    if (socketServer) {
      socketServer.to(`user_${supportMessage.userId}`).emit('support_message_reply', {
        messageId,
        replyMessage,
        replyedAt: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: "Reply sent successfully",
      data: supportMessage
    });
  } catch (error) {
    console.error("Error replying to support message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send reply",
      error: error.message
    });
  }
};

// Mark message as read by admin
export const markAsReadByAdmin = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await SupportMessage.findByIdAndUpdate(
      messageId,
      {
        isReadByAdmin: true
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Support message not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Marked as read",
      data: message
    });
  } catch (error) {
    console.error("Error marking as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update read status",
      error: error.message
    });
  }
};

// Update message status (Admin only)
export const updateSupportMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status, priority } = req.body;

    const validStatuses = ['open', 'in-progress', 'resolved', 'closed'];
    const validPriorities = ['low', 'medium', 'high', 'urgent'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority"
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    updateData.lastUpdatedBy = 'admin';

    const message = await SupportMessage.findByIdAndUpdate(
      messageId,
      updateData,
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Support message not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: message
    });
  } catch (error) {
    console.error("Error updating message status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update status",
      error: error.message
    });
  }
};

// Get support statistics (Admin only)
export const getSupportStats = async (req, res) => {
  try {
    const total = await SupportMessage.countDocuments();
    const open = await SupportMessage.countDocuments({ status: 'open' });
    const inProgress = await SupportMessage.countDocuments({ status: 'in-progress' });
    const resolved = await SupportMessage.countDocuments({ status: 'resolved' });
    const unread = await SupportMessage.countDocuments({ isReadByAdmin: false });

    res.status(200).json({
      success: true,
      data: {
        total,
        open,
        inProgress,
        resolved,
        unread
      }
    });
  } catch (error) {
    console.error("Error fetching support stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch support statistics",
      error: error.message
    });
  }
};
