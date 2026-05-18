let ioInstance = null;

export const initReminderSocket = (io) => {
  ioInstance = io;

  io.on("connection", (socket) => {
    socket.on("join:user", (userId) => {
      socket.join(`user:${userId}`);
    });
  });
};

export const getIO = () => ioInstance;
