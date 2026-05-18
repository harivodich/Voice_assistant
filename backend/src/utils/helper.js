const phraseCorrections = {
  // =========================
  // TIME / DATE
  // =========================

  "tôi nay": "tối nay",
  "toi nay": "tối nay",
  "toi nai": "tối nay",
  "tối nai": "tối nay",

  "hom nay": "hôm nay",
  "ngay mai": "ngày mai",
  "ngày may": "ngày mai",

  "mấy dờ": "mấy giờ",
  "may gio": "mấy giờ",

  "bay gio": "bảy giờ",
  "bẩy giờ": "bảy giờ",

  "ba mươi phúc": "ba mươi phút",
  "ba mươi phut": "ba mươi phút",

  "một tiếng nữa": "1 tiếng nữa",
  "hai tiếng nữa": "2 tiếng nữa",
  "ba tiếng nữa": "3 tiếng nữa",

  // =========================
  // CALENDAR
  // =========================

  "hỷ lịch": "hủy lịch",
  "hỉ lịch": "hủy lịch",
  "huy lich": "hủy lịch",

  "lich hoc": "lịch học",
  "nhac toi": "nhắc tôi",

  // =========================
  // QUESTION
  // =========================

  lazi: "là gì",
  lazy: "là gì",
  "la gi": "là gì",

  // =========================
  // APPS / BRANDS
  // =========================

  "du túp": "youtube",
  "giu tu be": "youtube",

  "face book": "facebook",

  "gu gồ": "google",

  "cờ rôm": "chrome",

  // =========================
  // TECH
  // =========================

  "block chain": "blockchain",

  "git hub": "github",

  "post gre": "postgres",
};

// =========================
// NUMBER WORD MAP
// =========================

const numberWords = {
  không: 0,
  một: 1,
  mốt: 1,
  hai: 2,
  ba: 3,
  bốn: 4,
  tư: 4,
  năm: 5,
  lăm: 5,
  sáu: 6,
  bảy: 7,
  bẩy: 7,
  tám: 8,
  chín: 9,
  mười: 10,
};

// =========================
// NORMALIZE NUMBER WORDS
// =========================

function normalizeVietnameseNumbers(text) {
  // ba mươi -> 30
  text = text.replace(/\bba mươi\b/g, "30");

  // hai mươi -> 20
  text = text.replace(/\bhai mươi\b/g, "20");

  // một tiếng -> 1 tiếng
  for (const [word, value] of Object.entries(numberWords)) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");

    text = text.replace(regex, value.toString());
  }

  return text;
}

// =========================
// NORMALIZE TIME EXPRESSIONS
// =========================

function normalizeTimeExpressions(text) {
  // 7 giờ rưỡi -> 7 giờ 30 phút
  text = text.replace(/\b(\d{1,2})\s*giờ\s*rưỡi\b/gi, "$1 giờ 30 phút");

  // 7 rưỡi -> 7 giờ 30 phút
  text = text.replace(/\b(\d{1,2})\s*rưỡi\b/gi, "$1 giờ 30 phút");

  // 7h30p -> 7 giờ 30 phút
  text = text.replace(/\b(\d{1,2})h(\d{1,2})p\b/gi, "$1 giờ $2 phút");

  // 7h30 -> 7 giờ 30 phút
  text = text.replace(/\b(\d{1,2})h(\d{1,2})\b/gi, "$1 giờ $2 phút");

  // 7h -> 7 giờ
  text = text.replace(/\b(\d{1,2})h\b/gi, "$1 giờ");

  return text;
}

// =========================
// REMOVE FILLER WORDS
// =========================

function removeFillerWords(text) {
  const fillerPatterns = [
    /\bờ{2,}\b/g,
    /\bà{2,}\b/g,
    /\bơ{2,}\b/g,
    /\bum+\b/g,
    /\buh+\b/g,
    /\bờm{2,}\b/g,
  ];

  for (const pattern of fillerPatterns) {
    text = text.replace(pattern, " ");
  }

  return text;
}

// =========================
// MAIN CLEANUP FUNCTION
// =========================

export function cleanupAsrText(input = "") {
  let text = (input ?? "").toString().toLowerCase().trim();

  // Unicode normalize
  text = text.normalize("NFC");

  // =========================
  // REMOVE PUNCTUATION
  // =========================

  text = text.replace(/[“”"'`]/g, "");

  text = text.replace(/[?!.,;:]+/g, " ");

  text = text.replace(/[-_/]+/g, " ");

  // =========================
  // PHRASE CORRECTIONS
  // =========================

  for (const [wrong, correct] of Object.entries(phraseCorrections)) {
    const regex = new RegExp(`\\b${wrong}\\b`, "gi");

    text = text.replace(regex, correct);
  }

  // =========================
  // REMOVE FILLERS
  // =========================

  text = removeFillerWords(text);

  // =========================
  // NUMBER NORMALIZATION
  // =========================

  text = normalizeVietnameseNumbers(text);

  // =========================
  // TIME NORMALIZATION
  // =========================

  text = normalizeTimeExpressions(text);

  // =========================
  // FINAL CLEANUP
  // =========================

  text = text.replace(/\s+/g, " ").trim();

  return text;
}
