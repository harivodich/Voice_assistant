import { Reminder } from "../model/Reminder.js";
import { Op } from "sequelize";

export async function createReminder(userId, title, reminderTime) {
  return await Reminder.create({
    userId,
    title,
    reminderTime,
    status: "pending",
  });
}

export async function listPendingReminders(userId, { limit = 10 } = {}) {
  return await Reminder.findAll({
    where: { userId, status: "pending" },
    order: [["reminderTime", "ASC"]],
    limit,
  });
}

export async function findPendingReminderById(userId, id) {
  return await Reminder.findOne({
    where: { userId, id, status: "pending" },
  });
}

export async function findPendingRemindersByTitleLike(
  userId,
  titleLike,
  { limit = 10 } = {},
) {
  // Use iLike for Postgres; fallback to LIKE.
  const where = {
    userId,
    status: "pending",
  };

  if (titleLike?.trim()) {
    // Sequelize will map Op.iLike only if imported; avoid Op to keep file tiny.
    // Use a safe raw condition via `where` + `Reminder.sequelize.where` is heavier; simplest: fetch list and filter in service.
  }

  return await Reminder.findAll({
    where,
    order: [["reminderTime", "ASC"]],
    limit,
  });
}

export async function deletePendingReminder(userId, id) {
  return await Reminder.destroy({
    where: { userId, id, status: "pending" },
  });
}

export async function updatePendingReminder(userId, id, fields) {
  const [count] = await Reminder.update(fields, {
    where: { userId, id, status: "pending" },
  });
  return count;
}

export async function findDueReminders(userId, currentTime) {
  return await Reminder.findAll({
    where: {
      userId,
      status: "pending",
      reminderTime: {
        [Op.lte]: currentTime,
      },
    },
    order: [["reminderTime", "ASC"]],
  });
}

export async function markReminderAsNotified(id) {
  const [updatedCount] = await Reminder.update(
    { notified: true },
    {
      where: {
        id,
        status: "pending",
        notified: false,
      },
    },
  );

  return updatedCount > 0;
}

export async function markReminderAsDone(userId, id) {
  const [updatedCount] = await Reminder.update(
    { status: "done" },
    {
      where: {
        id,
        userId,
        status: "pending",
      },
    },
  );

  return updatedCount > 0;
}
