
import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

export default function useSocket({ enabled = true } = {}) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled) {
      setConnected(false);
      return undefined;
    }

    const token = localStorage.getItem("access_token");

    if (!token) {
      setConnected(false);
      setError("Sign in to connect to live updates.");
      return undefined;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    const handleConnect = () => {
      setConnected(true);
      setError("");
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    const handleConnectError = (err) => {
      setConnected(false);
      setError(err.message || "Unable to connect to live updates.");
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.disconnect();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }
    };
  }, [enabled]);

  const emit = useCallback((event, payload, callback) => {
    const socket = socketRef.current;

    if (!socket?.connected) {
      throw new Error("Socket is not connected.");
    }

    socket.emit(event, payload, callback);
  }, []);

  const subscribe = useCallback((event, handler) => {
    const socket = socketRef.current;

    if (!socket || typeof handler !== "function") {
      return () => {};
    }

    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
    };
  }, []);

  return {
    socket: socketRef,
    connected,
    error,
    emit,
    subscribe,
  };
}
