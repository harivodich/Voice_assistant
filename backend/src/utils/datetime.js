import { cleanupAsrText } from "./helper.js";

const WEEKDAYS = [
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
  "Chủ Nhật",
];

const VN_TIMEZONE = "Asia/Ho_Chi_Minh";

export function getNow() {
  return new Date(
    new Date().toLocaleString("en-US", {
      timeZone: VN_TIMEZONE,
    }),
  );
}

export function handleTimeQuery(text) {
  text = cleanupAsrText(text);

  const now = getNow();

  // ===== CURRENT TIME =====
  if (text.includes("mấy giờ") || text.includes("giờ hiện tại")) {
    return `Bây giờ là ${formatTime(now)}.`;
  }

  // ===== TODAY =====
  if (text.includes("hôm nay")) {
    if (text.includes("ngày")) {
      return `Hôm nay là ngày ${formatDate(now)}.`;
    }

    if (text.includes("thứ")) {
      return `Hôm nay là ${WEEKDAYS[getWeekday(now)]}.`;
    }
  }

  // ===== TOMORROW =====
  if (text.includes("ngày mai")) {
    const tmr = addDays(now, 1);

    return `Ngày mai là ${formatDate(tmr)} (${WEEKDAYS[getWeekday(tmr)]}).`;
  }

  // ===== YESTERDAY =====
  if (text.includes("hôm qua")) {
    const ytd = addDays(now, -1);

    return `Hôm qua là ${formatDate(ytd)} (${WEEKDAYS[getWeekday(ytd)]}).`;
  }

  // ===== X DAYS LATER =====
  let match = text.match(/(\d+)\s+ngày\s+nữa/);

  if (match) {
    const days = parseInt(match[1]);

    const future = addDays(now, days);

    return `${days} ngày nữa là ${formatDate(future)} (${WEEKDAYS[getWeekday(future)]}).`;
  }

  // ===== X DAYS AGO =====
  match = text.match(/(\d+)\s+ngày\s+trước/);

  if (match) {
    const days = parseInt(match[1]);

    const past = addDays(now, -days);

    return `${days} ngày trước là ${formatDate(past)} (${WEEKDAYS[getWeekday(past)]}).`;
  }

  // ===== X WEEKS LATER =====
  match = text.match(/(\d+)\s+tuần\s+nữa/);

  if (match) {
    const weeks = parseInt(match[1]);

    const future = addDays(now, weeks * 7);

    return `${weeks} tuần nữa là ${formatDate(future)} (${WEEKDAYS[getWeekday(future)]}).`;
  }

  // ===== DAY OF WEEK =====
  if (text.includes("thứ mấy")) {
    return `Hôm nay là ${WEEKDAYS[getWeekday(now)]}.`;
  }

  // ===== FULL DATE =====
  if (
    text.includes("ngày tháng năm hiện tại") ||
    text.includes("thời gian hiện tại")
  ) {
    return `Hiện tại là ${formatTime(now)} ngày ${formatDate(now)}.`;
  }

  // ===== COUNTDOWN TẾT =====
  if (text.includes("tết")) {
    let tet = getTetDate(now.getFullYear());

    if (now > tet) {
      tet = getTetDate(now.getFullYear() + 1);
    }

    const diff = Math.floor((tet - now) / (1000 * 60 * 60 * 24));

    return `Còn ${diff} ngày nữa đến Tết.`;
  }

  return null;
}

function getTetDate(year) {
  const TET_DATES = {
    2025: [1, 29],
    2026: [2, 17],
    2027: [2, 6],
  };

  if (TET_DATES[year]) {
    const [month, day] = TET_DATES[year];

    return new Date(year, month - 1, day);
  }

  return new Date(year, 1, 10);
}

function formatTime(date) {
  return date.toLocaleTimeString("vi-VN", {
    hour12: false,
  });
}

function formatDate(date) {
  return date.toLocaleDateString("vi-VN");
}

function addDays(date, days) {
  const result = new Date(date);

  result.setDate(result.getDate() + days);

  return result;
}

// JS Sunday = 0
// Convert to Monday = 0
function getWeekday(date) {
  return (date.getDay() + 6) % 7;
}
