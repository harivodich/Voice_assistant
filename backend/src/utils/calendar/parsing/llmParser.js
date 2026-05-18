import axios from "axios";
import { env } from "../../env.js";
import { extractTitle } from "./ruleParser.js";

const SYSTEM_PROMPT = `
Bạn là bộ trích xuất dữ liệu lịch/nhắc việc.
Nhiệm vụ: từ câu tiếng Việt của người dùng, trích xuất thông tin nhắc việc và trả về JSON DUY NHẤT.

YÊU CẦU:
- Chỉ xuất JSON thuần, không thêm chữ khác, không dùng markdown code fence.
- JSON schema:
{
  "title": string,
  "datetime_iso": string | null
}
- "datetime_iso" phải là ISO-8601 theo múi giờ Asia/Ho_Chi_Minh (ví dụ: "2025-06-01T14:30:00+07:00").
- Nếu người dùng không nói rõ thời gian/ngày → để null.
`.trim();

function stripCodeFence(raw) {
  return raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

export async function extractWithLlm(rawText, now) {
  const userPrompt = `
[NOW]
${now.toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })}

[USER MESSAGE]
${rawText}
`.trim();

  let response;
  try {
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
            content: userPrompt,
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
  } catch (err) {
    console.error("[llmParser] Network error:", err.message);
    return null;
  }

  const raw = data?.choices?.[0]?.message?.content || "";

  try {
    const parsed = JSON.parse(stripCodeFence(raw));

    const title = typeof parsed?.title === "string" ? parsed.title.trim() : "";

    const datetimeIso =
      typeof parsed?.datetime_iso === "string"
        ? parsed.datetime_iso.trim()
        : null;

    return {
      title: title || extractTitle(rawText),
      datetimeIso: datetimeIso || null,
    };
  } catch (err) {
    console.error("[llmParser] JSON parse error:", err.message, "| raw:", raw);
    return null;
  }
}
