import { io } from "socket.io-client";

let socketInstance = null;

export const connectSocket = (token) => {
  if (!token) return null;
  if (socketInstance && socketInstance.connected) return socketInstance;

  socketInstance = io("http://localhost:3000", {
    auth: { token },
    transports: ["websocket"],
  });

  return socketInstance;
};

export const getSocket = () => socketInstance;

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
