import Notification from "../models/NotificationModel.js";
import {User} from "../models/Usermodels.js";

export const createNotifications = async ({ app, recipients = [], actorId = null, type = 'support_message', title = '', message = '', link = null, relatedId = null, orderId = null }) => {
  if (!recipients || recipients.length === 0) return [];
  const io = app?.get('io');
  const docs = [];
  for (const userId of recipients) {
    try {
      const n = await Notification.create({
        userId,
        actorId,
        type,
        title,
        message,
        link,
        relatedId,
        orderId,
      });
      docs.push(n);
      if (io) {
        io.to(`user_${String(userId)}`).emit('workflow:notification', { notification: n });
      }
    } catch (err) {
      console.error('Failed to create notification for', userId, err);
    }
  }
  return docs;
};

export const getNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const items = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();
    const unreadCount = await Notification.countDocuments({ userId, read: false });
    return res.status(200).json({ success: true, data: items, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const n = await Notification.findOneAndUpdate({ _id: id, userId: req.userId }, { read: true }, { new: true });
    if (!n) return res.status(404).json({ success: false, message: 'Notification not found' });
    return res.status(200).json({ success: true, data: n });
  } catch (error) {
    console.error('Mark read error:', error);
    return res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
};

export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.userId, read: false }, { read: true });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Mark all read error:', error);
    return res.status(500).json({ success: false, message: 'Failed to mark all as read' });
  }
};
