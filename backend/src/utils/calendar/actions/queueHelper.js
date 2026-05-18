import { reminderQueue } from "../../../config/queue.js";

function jobId(reminderId) {
  return `reminder-${reminderId}`;
}

export async function scheduleReminderJob(reminderId, userId, title, when) {
  const delay = when.getTime() - Date.now();

  if (delay <= 0) return;

  await cancelReminderJob(reminderId);

  await reminderQueue.add(
    "send-reminder",
    { userId, title, reminderId },
    {
      jobId: jobId(reminderId),
      delay,
      removeOnComplete: true,
      removeOnFail: false,
    },
  );
}

export async function cancelReminderJob(reminderId) {
  try {
    const job = await reminderQueue.getJob(jobId(reminderId));

    if (job) {
      await job.remove();
    }
  } catch {
    // ignore
  }
}
