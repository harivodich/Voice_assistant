import axios from "axios";
import { env } from "../utils/env.js";
import { getUserConversations } from "../repository/conversationRepository.js";
import { findUserById as findById } from "../repository/userRepository.js";
import { createChildLogger } from "../utils/logger.js";

const llmLogger = createChildLogger({ module: 'llm-service' });

const cleanLlmOutput = (answer) => {
  if (!answer) return "";

  let cleaned = answer.trim();

  const prefixes = ["Assistant:", "Trợ lý:", "AI:"];

  for (const prefix of prefixes) {
    if (cleaned.startsWith(prefix)) {
      cleaned = cleaned.slice(prefix.length).trim();
    }
  }

  return cleaned
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");
};

const buildStylePrompt = (profile) => {
  const rules = [];

  if (profile?.answer_length) {
    rules.push("Trả lời ngắn gọn (tối đa 3 câu).");
  }

  if (profile?.tone) {
    rules.push("Giọng điệu trang trọng.");
  }

  return rules.length
    ? rules.map((r) => `- ${r}`).join("\n")
    : "- Trả lời tự nhiên.";
};

const formatProfile = (profile) => {
  if (!profile) return "Không có";

  const lines = [];

  for (const [key, value] of Object.entries(profile)) {
    if (value === null || value === undefined) continue;

    if (Array.isArray(value)) {
      lines.push(`${key}: ${value.join(", ")}`);
      continue;
    }

    if (typeof value === "object") {
      lines.push(`${key}: ${JSON.stringify(value)}`);
      continue;
    }

    lines.push(`${key}: ${value}`);
  }

  return lines.length ? lines.join("\n") : "Không có";
};

const formatHistory = (conversations) => {
  if (!conversations?.length) return "Không có";

  return [...conversations]
    .slice(-10) // limit context
    .map((c) => `${c.role.toUpperCase()}: ${c.content}`)
    .join("\n");
};

export const generateAnswer = async (userId, text) => {
  try {
    if (!text?.trim()) {
      llmLogger.warn('Empty text provided', { userId });
      return "Bạn có thể nói lại không?";
    }

    llmLogger.info('Generating LLM answer', { userId, textLength: text.length });
    const user = await findById(userId);
    const profile = user?.profile || {};

    const conversations = await getUserConversations(userId);

    const systemPrompt = `
Bạn là trợ lý AI tiếng Việt.

NHIỆM VỤ:
- Trả lời tự nhiên, ngắn gọn, dễ nghe.
- Ưu tiên xử lý đúng yêu cầu hiện tại của người dùng.
- Có thể dùng thông tin hồ sơ người dùng nếu liên quan.
- Nếu không chắc chắn, hãy nói rõ bạn không chắc.

QUY TẮC:
- Chỉ trả lời tiếng Việt
- Không bịa thông tin
- Trả lời tự nhiên như trợ lý giọng nói
- Nếu không biết → nói không chắc chắn


PHONG CÁCH:
${buildStylePrompt(profile)}
`;

    const userPrompt = `
[USER PROFILE]
${formatProfile(profile)}

[CONVERSATION HISTORY]
${formatHistory(conversations)}

[USER MESSAGE]
${text}
`;

    llmLogger.info('Calling LLM API', { userId, model: env.LLM_MODEL });
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

    const output = data?.choices?.[0]?.message?.content || "";

    llmLogger.info('LLM response received', { userId, outputLength: output.length });
    const cleanedOutput = cleanLlmOutput(output) || "Tôi chưa thể trả lời lúc này.";
    llmLogger.info('LLM answer generated successfully', { userId, answerLength: cleanedOutput.length });
    return cleanedOutput;
  } catch (err) {
    llmLogger.error('LLM API error', { error: err.message, stack: err.stack, userId });
    return "Đã xảy ra lỗi khi gọi AI.";
  }
};
