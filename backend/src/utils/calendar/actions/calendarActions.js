import {
  createReminder,
  deletePendingReminder,
  findPendingReminderById,
  listPendingReminders,
  updatePendingReminder,
} from "../../../repository/reminderRepository.js";
import {
  detectCalendarAction,
  extractId,
  parseExplicitDate,
  parseRelativeDate,
  tryRuleBased,
  extractWithLlm,
  tryExtractNewTitle,
  pickCandidatesByTitle,
} from "../parsing/calendarParser.js";
import {
  formatViDateTime,
  formatReminderLine,
  filterByDateInTz,
  isValidDate,
} from "../calendarUtils.js";
import { scheduleReminderJob, cancelReminderJob } from "./queueHelper.js";

export async function handleListAction(userId, normalized, now) {
  const dateOnly =
    parseExplicitDate(normalized, now) || parseRelativeDate(normalized, now);

  const itemsAll = await listPendingReminders(userId, { limit: 50 });
  const items = filterByDateInTz(itemsAll, dateOnly).slice(0, 10);

  if (!items.length) {
    if (dateOnly) {
      const d = dateOnly.toLocaleDateString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
      });
      return `Ngày ${d} bạn chưa có nhắc việc nào.`;
    }
    return "Bạn chưa có nhắc việc nào đang chờ.";
  }

  const lines = items.map(formatReminderLine).join("\n");

  if (dateOnly) {
    const d = dateOnly.toLocaleDateString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
    return `Lịch ngày ${d} của bạn:\n${lines}\nBạn muốn hủy/sửa cái nào? (nói "hủy #ID" hoặc "đổi #ID sang …")`;
  }

  return `Đây là các nhắc việc sắp tới:\n${lines}\nBạn muốn hủy/sửa cái nào? (nói "hủy #ID" hoặc "đổi #ID sang …")`;
}

export async function handleDeleteAction(userId, normalized, rawText, recent) {
  const id = extractId(normalized);
  let target = null;

  if (id) {
    target = await findPendingReminderById(userId, id);
  } else {
    const candidates = pickCandidatesByTitle(recent, rawText);

    if (candidates.length === 1) {
      target = candidates[0];
    } else if (candidates.length > 1) {
      const lines = candidates.slice(0, 5).map(formatReminderLine).join("\n");
      return `Bạn muốn hủy nhắc nào?\n${lines}`;
    }
  }

  if (!target) {
    const items = recent.slice(0, 5);
    if (!items.length) return "Bạn chưa có nhắc việc nào.";
    return `Chọn nhắc cần hủy:\n${items.map(formatReminderLine).join("\n")}`;
  }

  // Cancel job FIRST — avoid firing after the DB row is gone
  await cancelReminderJob(target.id);
  await deletePendingReminder(userId, target.id);

  return `Đã hủy nhắc #${target.id}: "${target.title}"`;
}

export async function handleUpdateAction(
  userId,
  normalized,
  rawText,
  recent,
  now,
  reminderTime,
) {
  const id = extractId(normalized);
  let target = null;

  if (id) {
    target = await findPendingReminderById(userId, id);
  } else {
    const candidates = pickCandidatesByTitle(recent, rawText);

    if (candidates.length === 1) {
      target = candidates[0];
    } else if (candidates.length > 1) {
      return `Chọn nhắc cần sửa:\n${candidates
        .slice(0, 5)
        .map(formatReminderLine)
        .join("\n")}`;
    }
  }

  if (!target) return "Không tìm thấy nhắc để sửa.";

  let newWhen = isValidDate(reminderTime) ? reminderTime : null;

  if (!newWhen) {
    const llm = await extractWithLlm(rawText, now);
    if (llm?.datetimeIso) {
      const d = new Date(llm.datetimeIso);
      if (isValidDate(d)) newWhen = d;
    }
  }

  const newTitle = tryExtractNewTitle(rawText);

  if (!newWhen && !newTitle) {
    return "Bạn muốn sửa nội dung hay thời gian?";
  }

  if (newWhen && newWhen.getTime() < now.getTime() + 60_000) {
    return `Thời gian không hợp lệ: ${formatViDateTime(newWhen)}`;
  }

  const fields = {};
  if (newWhen) fields.reminderTime = newWhen;
  if (newTitle) fields.title = newTitle;

  await updatePendingReminder(userId, target.id, fields);

  // scheduleReminderJob removes the old job internally — no duplicate fire
  if (fields.reminderTime) {
    await scheduleReminderJob(
      target.id,
      userId,
      fields.title ?? target.title,
      fields.reminderTime,
    );
  }

  return `Đã cập nhật nhắc #${target.id}`;
}

export async function handleCreateAction(
  userId,
  rawText,
  now,
  ruleTitle,
  reminderTime,
  hasAnySignal,
) {
  let title = ruleTitle;
  let when = isValidDate(reminderTime) ? reminderTime : null;

  if (!when && hasAnySignal) {
    const llm = await extractWithLlm(rawText, now);
    if (llm?.title) title = llm.title;
    if (llm?.datetimeIso) {
      const d = new Date(llm.datetimeIso);
      if (isValidDate(d)) when = d;
    }
  }

  if (!when) return "Bạn muốn nhắc lúc nào?";

  if (when.getTime() < now.getTime() + 60_000) {
    return `Thời gian đã qua: ${formatViDateTime(when)}`;
  }

  const reminder = await createReminder(userId, title, when);

  await scheduleReminderJob(reminder.id, userId, title, when);

  return `Đã đặt nhắc: "${title}" vào ${formatViDateTime(when)}`;
}
