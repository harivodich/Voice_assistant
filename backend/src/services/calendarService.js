import { cleanupAsrText } from "../utils/helper.js";
import { listPendingReminders } from "../repository/reminderRepository.js";
import {
  detectCalendarAction,
  tryRuleBased,
} from "../utils/calendar/parsing/calendarParser.js";
import {
  handleListAction,
  handleDeleteAction,
  handleUpdateAction,
  handleCreateAction,
} from "../utils/calendar/actions/calendarActions.js";

export async function calendarHandler(rawText, userId) {
  const normalized = cleanupAsrText(rawText);
  const action = detectCalendarAction(normalized);
  const {
    now,
    title: ruleTitle,
    reminderTime,
    hasAnySignal,
  } = tryRuleBased(normalized);

  // ===== LIST =====
  if (action === "list") {
    return await handleListAction(userId, normalized, now);
  }

  // Load recent reminders for delete/update disambiguation
  const recent =
    action === "create"
      ? []
      : await listPendingReminders(userId, { limit: 30 });

  // ===== DELETE =====
  if (action === "delete") {
    return await handleDeleteAction(userId, normalized, rawText, recent);
  }

  // ===== UPDATE =====
  if (action === "update") {
    return await handleUpdateAction(
      userId,
      normalized,
      rawText,
      recent,
      now,
      reminderTime,
    );
  }

  // ===== CREATE =====
  return await handleCreateAction(
    userId,
    rawText,
    now,
    ruleTitle,
    reminderTime,
    hasAnySignal,
  );
}
