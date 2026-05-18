import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { getSocketBaseUrl } from "../services/http";

export function useReminderSocket(userId, onReminder) {
  const cbRef = useRef(onReminder);
  cbRef.current = onReminder;

  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const base = getSocketBaseUrl();

    const socket = io(base || undefined, {
      path: "/socket.io",
      transports: ["websocket"],
      autoConnect: true,
    });

    socketRef.current = socket;

    const onConnect = () => {
      // MUST match backend room
      socket.emit("join:user", userId);
    };

    const onReminder = (payload) => {
      cbRef.current?.(payload);
    };

    socket.on("connect", onConnect);
    socket.on("reminder", onReminder);

    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("reminder", onReminder);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);
}
