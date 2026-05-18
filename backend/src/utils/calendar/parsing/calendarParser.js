import { getNow } from "../../datetime.js";
import { cleanupAsrText } from "../../helper.js";
import {
  parseExplicitDate,
  parseRelativeDate,
  parseTimeOfDay,
  buildReminderDateTime,
  extractTitle,
} from "./ruleParser.js";

export {
  extractId,
  extractTitle,
  parseExplicitDate,
  parseRelativeDate,
  pickCandidatesByTitle,
  tryExtractNewTitle,
} from "./ruleParser.js";

export { extractWithLlm } from "./llmParser.js";

export function detectCalendarAction(text) {
  if (
    /(?:^|\s)(danh sách|liệt kê|xem lịch|xem nhắc|nhắc gì|có nhắc)(?:\s|$)/.test(
      text,
    ) ||
    /(?:^|\s)(có gì|lịch gì|có lịch gì)(?:\s|$)/.test(text)
  ) {
    return "list";
  }

  if (/(?:^|\s)(hủy|huỷ|xóa|xoá|bỏ|cancel)(?:\s|$)/.test(text)) {
    return "delete";
  }

  if (
    /(?:^|\s)(đổi|dời|chuyển|sửa|lùi|dời lại|chuyển sang)(?:\s|$)/.test(text)
  ) {
    return "update";
  }

  return "create";
}

export function tryRuleBased(rawText) {
  const normalized = cleanupAsrText(rawText);
  const now = getNow();

  const dateOnly =
    parseExplicitDate(normalized, now) || parseRelativeDate(normalized, now);

  const time = parseTimeOfDay(normalized);

  const reminderTime = dateOnly
    ? buildReminderDateTime({ dateOnly, time, rawText: normalized })
    : null;

  return {
    now,
    title: extractTitle(rawText), // keep original diacritics
    reminderTime,
    hasAnySignal: Boolean(dateOnly || time),
  };
}
