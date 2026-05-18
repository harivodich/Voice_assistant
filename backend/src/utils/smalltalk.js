import axios from "axios";
import { cleanupAsrText } from "./helper.js";
import { env } from "./env.js";

const HARD_SMALLTALK = [
  "chào",
  "hello",
  "hi",
  "xin chào",
  "bạn tên gì",
  "bạn là ai",
  "bạn khỏe không",
];

function isHardSmalltalk(text) {
  return HARD_SMALLTALK.includes(text);
}

function isSoftSmalltalk(text) {
  const keywords = ["chào", "hello", "hi", "hey"];

  const isShort = text.split(" ").length <= 4;

  return isShort && keywords.some((k) => text.includes(k));
}

const KNOWLEDGE_BLOCK = [
  "là gì",
  "giải thích",
  "định nghĩa",
  "tại sao",
  "how",
  "what",
];

function isKnowledgeQuery(text) {
  return KNOWLEDGE_BLOCK.some((k) => text.includes(k));
}

export function isSmalltalk(text) {
  text = cleanupAsrText(text);

  console.log("[INPUT]:", text);
  if (isKnowledgeQuery(text)) {
    console.log("[BLOCKED]: knowledge query");
    return false;
  }

  if (isHardSmalltalk(text)) {
    console.log("[MATCH]: hard smalltalk");
    return true;
  }

  if (isSoftSmalltalk(text)) {
    console.log("[MATCH]: soft smalltalk");
    return true;
  }

  return false;
}

const WEATHER_API_KEY = env.weatherApiKey;
const WEATHER_CITY = env.weatherCity;

export async function getWeather() {
  try {
    if (!WEATHER_API_KEY) return "Chưa cấu hình WEATHER_API_KEY.";
    const url =
      `https://api.openweathermap.org/data/2.5/weather` +
      `?q=${WEATHER_CITY}` +
      `&appid=${WEATHER_API_KEY}` +
      `&units=metric` +
      `&lang=vi`;

    const response = await axios.get(url);

    const data = response.data;

    return `Hôm nay ở ${WEATHER_CITY} ${data.weather[0].description}, nhiệt độ ${data.main.temp}°C.`;
  } catch (err) {
    console.error("[WEATHER ERROR]:", err.message);
    return "Không lấy được thời tiết.";
  }
}

export async function handleSmalltalk(text) {
  text = cleanupAsrText(text);

  if (text.includes("thời tiết")) {
    return await getWeather();
  }

  if (text.includes("bạn tên gì")) {
    return "Chào bạn! Rất vui được nói chuyện với bạn. Tôi là Hari.";
  }

  if (text.includes("bạn là ai")) {
    return "Chào bạn! Rất vui được nói chuyện với bạn. Tôi là trợ lý AI.";
  }

  return "Chào bạn! Rất vui được nói chuyện với bạn.";
}
