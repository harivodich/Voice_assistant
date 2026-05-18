const VN_TIMEZONE = "Asia/Ho_Chi_Minh";

export function formatViDateTime(date) {
  return date.toLocaleString("vi-VN", {
    timeZone: VN_TIMEZONE,
    hour12: false,
  });
}

export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isValidDate(d) {
  return d instanceof Date && !Number.isNaN(d.getTime());
}

export function clampInt(n, min, max) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

export function stripCommandNoise(text) {
  return text
    .replace(/\b(nhắc tôi|nhắc mình|nhắc|đặt lịch|tạo lịch|lên lịch)\b/g, " ")
    .replace(/\b(giúp|với|nhé|nha|đi)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatReminderLine(r) {
  return `#${r.id} — "${r.title}" — ${formatViDateTime(new Date(r.reminderTime))}`;
}

export function ymdInTz(date) {
  // Stable YYYY-MM-DD in Asia/Ho_Chi_Minh for date comparisons
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: VN_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function filterByDateInTz(reminders, dateOnly) {
  if (!dateOnly || !isValidDate(dateOnly)) return reminders;
  const target = ymdInTz(dateOnly);
  return reminders.filter((r) => ymdInTz(new Date(r.reminderTime)) === target);
}
