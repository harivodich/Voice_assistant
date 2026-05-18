// services/textNormalizationService.js

import axios from "axios";
import { env } from "./env.js";
import { cleanupAsrText } from "./helper.js";

export async function normalizeUserText(text = "") {
  try {
    const systemPrompt = `
Bạn là bộ chuẩn hóa text tiếng Việt cho voice assistant.

Nhiệm vụ:
- Sửa lỗi speech-to-text
- Sửa lỗi chính tả phổ biến
- Chuẩn hóa từ viết tắt tiếng Việt:
  (ko → không, dc → được, bn → bạn, j → gì, k → không)
- Chuyển số chữ thành số (hai mươi → 20)
- Chuẩn hóa thời gian/ngày tháng nếu có thể suy ra rõ ràng
- Loại bỏ từ đệm không cần thiết trong hội thoại (à, ờ, thì, bạn ơi, kiểu như)

QUAN TRỌNG:
- KHÔNG thay đổi ý nghĩa câu
- KHÔNG thêm thông tin mới
- KHÔNG suy đoán vượt dữ liệu có trong câu
- KHÔNG trả lời người dùng
- CHỈ trả về text đã chuẩn hóa
`;

    const response = await axios.post(
      env.LLM_URL,
      {
        model: env.LLM_MODEL,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0.2,
        max_tokens: 180,
        stream: false,
      },
      {
        timeout: 30000,
        headers: {
          Authorization: `Bearer ${env.groqApiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = response.data;

    const output = data?.choices?.[0]?.message?.content || "";

    return output.replace(/\s+/g, " ").trim();
  } catch (err) {
    console.error("normalizeUserText error:", err.message);

    return text;
  }
}

export async function processUserInput({ text, isVoice = false }) {
  if (!text) {
    return {
      raw: "",
      cleaned: "",
      normalized: "",
      final: "",
    };
  }

  const raw = text.trim().toLowerCase();

  // 1. deterministic cleanup
  const cleaned = cleanupAsrText(raw);

  // 2. chỉ gọi LLM nếu là voice input
  let normalized = cleaned;

  if (isVoice) {
    normalized = await normalizeUserText(cleaned);
  }

  const final = normalized.replace(/\s+/g, " ").trim();

  return {
    raw,
    cleaned,
    normalized,
    final,
  };
}
