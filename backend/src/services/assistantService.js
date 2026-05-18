import { createMessage } from "../repository/conversationRepository.js";
import { generateSpeech, predictIntent, transcribe } from "./aiApiService.js";
import { qaHandler } from "./qaService.js";
import { handlePersonalization } from "./memoryService.js";
import { deviceHandler } from "./deviceControlService.js";
import { calendarHandler } from "./calendarService.js";
import { processUserInput } from "../utils/textNormalization.js";
import { cleanupAsrText } from "../utils/helper.js";
import { createChildLogger } from "../utils/logger.js";

const assistantLogger = createChildLogger({ module: 'assistant-service' });

const detectPlatformFromUserAgent = (ua) => {
  const s = (ua || "").toLowerCase();
  if (!s) return "unknown";
  if (s.includes("android") || s.includes("iphone") || s.includes("ipad"))
    return "mobile";
  return "pc";
};

export const handleVoiceChat = async ({
  content,
  audioPath,
  userId,
  userAgent = "",
  check,
}) => {
  assistantLogger.info('Handling voice chat', { userId, hasAudio: !!audioPath, hasText: !!content });
  // 1. STT
  let text = "";
  if (check) {
    assistantLogger.info('Transcribing audio', { userId, audioSize: audioPath?.length });
    text = await transcribe(audioPath);
    assistantLogger.info('Audio transcribed', { userId, transcribedText: text });
  } else {
    text = content;
  }

  text = cleanupAsrText(text);

  // 2. Save user message
  await createMessage(userId, "user", text);

  assistantLogger.info('User message saved', { userId, text });
  // 3. Intent
  const intent = await predictIntent(text);

  assistantLogger.info('Intent predicted', { userId, intent, text });
  const platform = detectPlatformFromUserAgent(userAgent);
  let reply = "";
  let action = null;

  // 4. Route handler
  switch (intent) {
    case "qa":
      assistantLogger.info('Routing to QA handler', { userId });
      reply = await qaHandler(text, userId);
      break;

    case "calendar":
      assistantLogger.info('Routing to calendar handler', { userId });
      reply = await calendarHandler(text, userId);
      break;

    case "personalize":
      assistantLogger.info('Routing to personalization handler', { userId });
      reply = await handlePersonalization(userId, text);
      if (!reply) {
        assistantLogger.info('Personalization failed, fallback to QA', { userId });
        reply = await qaHandler(text, userId);
      }
      break;

    case "control_device":
      assistantLogger.info('Routing to device control handler', { userId });
      {
        const out = await deviceHandler(text, { userId, platform });
        reply = out.reply;
        action = out.action || null;
      }
      break;

    default:
      assistantLogger.warn('Unknown intent', { userId, intent });
      reply = "Tôi chưa hiểu yêu cầu của bạn.";
  }

  assistantLogger.info('Assistant reply generated', { userId, intent, replyLength: reply.length, action });
  // 5. Save assistant message;
  await createMessage(userId, "assistant", reply);

  return { intent, reply, action, platform };
};

export const handleGenerateSpeech = async (text) => {
  assistantLogger.info('Generating speech', { textLength: text.length });
  const audioBuffer = await generateSpeech(text);
  assistantLogger.info('Speech generated successfully', { audioSize: audioBuffer.length });
  return audioBuffer;
};
