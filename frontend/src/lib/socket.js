
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

let socket = null;

export function connectSocket(token) {
  const authToken = token || localStorage.getItem("access_token");

  if (socket?.connected) {
    const currentToken = socket.auth?.token;

    if (currentToken === authToken) {
      return socket;
    }

    socket.disconnect();
    socket = null;
  }

  if (!authToken) {
    disconnectSocket();
    return null;
  }

  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      auth: {
        token: authToken,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  } else {
    socket.auth = { token: authToken };
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

export default {
  connect: connectSocket,
  get: getSocket,
  disconnect: disconnectSocket,
};
