let ioInstance = null;

const userSockets = new Map();

export const setSocketServer = (io) => {
  ioInstance = io;
};

export const getSocketServer = () => ioInstance;

export const registerUserSocket = (userId, socketId) => {
  if (!userId || !socketId) return;
  const key = String(userId);
  const existing = userSockets.get(key) || new Set();
  existing.add(socketId);
  userSockets.set(key, existing);
};

export const unregisterUserSocket = (socketId) => {
  if (!socketId) return;
  userSockets.forEach((socketSet, userId) => {
    if (socketSet.has(socketId)) {
      socketSet.delete(socketId);
      if (socketSet.size === 0) userSockets.delete(userId);
    }
  });
};

export const emitToUsers = (userIds, eventName, payload) => {
  if (!ioInstance || !Array.isArray(userIds)) return;
  const uniqueUserIds = [...new Set(userIds.map((id) => String(id)))];
  uniqueUserIds.forEach((userId) => {
    const socketSet = userSockets.get(userId);
    if (!socketSet) return;
    socketSet.forEach((socketId) => {
      ioInstance.to(socketId).emit(eventName, payload);
    });
  });
};
