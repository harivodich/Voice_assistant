import { registerVoiceSocket } from "./voiceSocket.js";
import { initReminderSocket } from "./reminderSocket.js";
import { setIO } from "./ioInstance.js";
import { socketConnections } from "../utils/metrics.js";
import { createChildLogger } from "../utils/logger.js";

const socketLogger = createChildLogger({ module: 'socket' });

export const initializeSocketHandlers = (io) => {
  setIO(io);

  io.on("connection", (socket) => {
    socketLogger.info('Socket connected', { socketId: socket.id });
    socketConnections.inc();

    registerVoiceSocket(io, socket);

    socket.on("disconnect", () => {
      socketLogger.info('Socket disconnected', { socketId: socket.id });
      socketConnections.dec();
    });
  });

  initReminderSocket(io);
  socketLogger.info('Socket handlers initialized');
};
