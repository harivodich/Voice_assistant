import { Worker } from "bullmq";
import { connection } from "../config/redis.js";
import { io } from "../socket/ioInstance.js";
import { createChildLogger } from "../utils/logger.js";

const workerLogger = createChildLogger({ module: 'reminder-worker' });

export const reminderWorker = new Worker(
  "reminder",
  async (job) => {
    workerLogger.info('Reminder job started', { jobId: job.id, data: job.data });

    const { userId, title, reminderId } = job.data;

    workerLogger.info('Sending reminder to user', { userId, title, reminderId });
    io.to(`user:${userId}`).emit("reminder", {
      message: `Đến giờ "${title}" rồi!`,
      reminderId,
    });
    workerLogger.info('Reminder sent successfully', { userId, reminderId });
  },
  { connection },
);

reminderWorker.on('completed', (job) => {
  workerLogger.info('Reminder job completed', { jobId: job.id });
});

reminderWorker.on('failed', (job, err) => {
  workerLogger.error('Reminder job failed', { jobId: job?.id, error: err.message, stack: err.stack });
});
