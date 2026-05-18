import { PROFILE_QUERY_PATTERNS } from "../constant/memory_patterns.js";
import { handleTimeQuery } from "../utils/datetime.js";
import { handleSmalltalk, isSmalltalk } from "../utils/smalltalk.js";
import { retrieveFAQ } from "./aiApiService.js";
import { generateAnswer } from "./llmService.js";
import { handlePersonalization } from "./memoryService.js";
import { getUserProfile } from "../repository/userRepository.js";
import { cleanupAsrText } from "../utils/helper.js";

export const qaHandler = async (rawText, userId) => {
  let text = cleanupAsrText(rawText);

  // 1. time query
  const timeAnswer = handleTimeQuery(text);
  if (timeAnswer) return timeAnswer;

  // 2. weather / smalltalk
  if (text.includes("thời tiết") || isSmalltalk(text)) {
    return await handleSmalltalk(text);
  }
  // 3. follow-up + personalization FIRST
  const personalizationResponse = await handlePersonalization(userId, text);
  if (personalizationResponse) return personalizationResponse;

  // 4. memory read
  const profile = await getUserProfile(userId);
  const memoryAnswer = retrieveProfileAnswer(profile, text);
  if (memoryAnswer) return memoryAnswer;

  // 5. FAQ retrieval
  const faq = await retrieveFAQ(text);
  if (faq) return faq;

  // 6. LLM fallback
  const llm = await generateAnswer(userId, text);
  if (llm) return llm;

  return "Xin lỗi, mình chưa hiểu ý bạn.";
};

function retrieveProfileAnswer(profile, text) {
  console.log("-------------Profile for QA:", profile);
  for (const rule of PROFILE_QUERY_PATTERNS) {
    for (const pattern of rule.patterns) {
      const regex = new RegExp(pattern);

      if (regex.test(text)) {
        const value = profile[rule.field];
        if (value) {
          return rule.template.replace("{}", value);
        }

        return "Tôi chưa biết thông tin đó về bạn.";
      }
    }
  }

  return null;
}
