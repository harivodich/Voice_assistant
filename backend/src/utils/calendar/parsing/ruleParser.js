import { cleanupAsrText } from "../../helper.js";
import { clampInt, isValidDate, stripCommandNoise } from "../calendarUtils.js";

function applyDayPeriod(text, hour) {
  const hasMorning = /\b(sáng)\b/.test(text);
  const hasAfternoon = /\b(chiều)\b/.test(text);
  const hasEvening = /\b(tối|đêm)\b/.test(text);

  if (hasMorning) return hour;

  if (hasAfternoon) {
    return hour === 12 ? 12 : hour >= 1 && hour <= 11 ? hour + 12 : hour;
  }

  if (hasEvening) {
    return hour === 12 ? 0 : hour >= 1 && hour <= 11 ? hour + 12 : hour;
  }

  return hour;
}

function buildValidDate(day, month, year) {
  const d = new Date(year, month - 1, day);
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day
  ) {
    return null;
  }
  return d;
}

function normalizeYear(y) {
  return y < 100 ? y + 2000 : y;
}

export function parseTimeOfDay(text) {
  let match = text.match(
    /(?:^|\s)(?:lúc\s*)?(?<h>\d{1,2})\s*(?:h|giờ|:)\s*(?<m>\d{1,2})(?:\s*(?:p|phút))?(?=\s|$)/i,
  );

  if (match) {
    return {
      hour: clampInt(parseInt(match.groups.h, 10), 0, 23),
      minute: clampInt(parseInt(match.groups.m, 10), 0, 59),
    };
  }

  match = text.match(/(?:^|\s)(?:lúc\s*)?(?<h>\d{1,2})\s*(?:h|giờ)(?=\s|$)/i);

  if (match) {
    return {
      hour: clampInt(parseInt(match.groups.h, 10), 0, 23),
      minute: 0,
    };
  }

  match = text.match(/(?:^|\s)(?:lúc\s*)?(?<h>\d{1,2})\s*rưỡi(?=\s|$)/i);

  if (match) {
    return {
      hour: clampInt(parseInt(match.groups.h, 10), 0, 23),
      minute: 30,
    };
  }

  match = text.match(/(?:^|\s)lúc\s*(?<h>\d{1,2})(?=\s|$)/i);

  if (match) {
    return {
      hour: clampInt(parseInt(match.groups.h, 10), 0, 23),
      minute: 0,
    };
  }

  return null;
}

export function parseExplicitDate(text, now) {
  // dd/mm/yyyy or dd-mm-yyyy
  let m = text.match(/\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/);
  if (m) {
    return buildValidDate(
      clampInt(parseInt(m[1], 10), 1, 31),
      clampInt(parseInt(m[2], 10), 1, 12),
      m[3] ? normalizeYear(parseInt(m[3], 10)) : now.getFullYear(),
    );
  }

  m = text.match(
    /\bngày\s+(\d{1,2})\s+tháng\s+(\d{1,2})(?:\s+năm\s+(\d{4}))?\b/,
  );
  if (m) {
    return buildValidDate(
      clampInt(parseInt(m[1], 10), 1, 31),
      clampInt(parseInt(m[2], 10), 1, 12),
      m[3] ? parseInt(m[3], 10) : now.getFullYear(),
    );
  }

  return null;
}

export function parseRelativeDate(text, now) {
  if (/(?:^|\s)(hôm nay)(?:\s|$)/.test(text)) {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  if (/(?:^|\s)(ngày mai)(?:\s|$)/.test(text)) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  if (/(?:^|\s)(mốt|ngày kia)(?:\s|$)/.test(text)) {
    const d = new Date(now);
    d.setDate(d.getDate() + 2);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  const m = text.match(/(?:^|\s)(\d+)\s+ngày\s+nữa(?:\s|$)/);
  if (m) {
    const days = clampInt(parseInt(m[1], 10), 0, 365);
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  return null;
}

export function buildReminderDateTime({ dateOnly, time, rawText }) {
  if (!dateOnly || !isValidDate(dateOnly)) return null;

  const hour = applyDayPeriod(rawText, time?.hour ?? 9);
  const minute = time?.minute ?? 0;

  const dt = new Date(
    dateOnly.getFullYear(),
    dateOnly.getMonth(),
    dateOnly.getDate(),
    hour,
    minute,
    0,
    0,
  );

  return isValidDate(dt) ? dt : null;
}

export function extractTitle(rawText) {
  let t = stripCommandNoise(rawText);

  t = t
    .replace(/\b(hôm nay|ngày mai|ngày kia|mốt)\b/gi, " ")
    .replace(/\b(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?\b/g, " ")
    .replace(/\bngày\s+\d{1,2}\s+tháng\s+\d{1,2}(?:\s+năm\s+\d{4})?\b/gi, " ")
    .replace(
      /(?:^|\s)(?:lúc\s*)?\d{1,2}\s*(?:h|giờ|:)\s*(?:\d{1,2})?(?:\s*(?:p|phút))?(?=\s|$)/gi,
      " ",
    )
    .replace(/(?:^|\s)(?:lúc\s*)?\d{1,2}\s*rưỡi(?=\s|$)/gi, " ")
    .replace(/(?:^|\s)lúc\s*\d{1,2}(?=\s|$)/gi, " ")
    .replace(/\b(sáng|chiều|tối|đêm)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return t || "Nhắc việc";
}

export function tryExtractNewTitle(rawText) {
  let m = rawText.match(/\b(nội dung|tiêu đề)\s*(?:là|thành)?\s*(.+)\s*$/i);
  if (m?.[2]) return m[2].trim() || null;

  m = rawText.match(/\bthành\s+[""](.+?)[""]\s*$/i);
  if (m?.[1]) return m[1].trim() || null;

  return null;
}

export function extractId(text) {
  let m = text.match(/(?:^|\s)(?:id|mã|ma|số|so)\s*(\d{1,18})(?=\s|$)/);
  if (!m) m = text.match(/#\s*(\d{1,18})(?=\s|$)/);
  if (!m?.[1]) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) ? n : null;
}

export function pickCandidatesByTitle(reminders, rawText) {
  const key = cleanupAsrText(extractTitle(rawText));
  if (!key) return [];
  return reminders.filter((r) => cleanupAsrText(r.title).includes(key));
}
