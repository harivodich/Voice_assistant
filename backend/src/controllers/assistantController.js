import {
  handleVoiceChat,
  handleGenerateSpeech,
} from "../services/assistantService.js";
import { logger, createChildLogger } from "../utils/logger.js";

const assistantLogger = createChildLogger({ module: 'assistant' });

export const voiceChat = async (req, res) => {
  try {
    assistantLogger.info('Voice chat request received', { userId: req.user.id });
    if (!req.file) {
      assistantLogger.warn('No audio file provided', { userId: req.user.id });
      return res.status(400).json({
        error: "Không tìm thấy file âm thanh",
        intent: "error",
        reply: "Không tìm thấy file âm thanh.",
        action: null,
        platform: "unknown",
      });
    }

    const audioBuffer = req.file.buffer;

    // Xử lý voice chat
    assistantLogger.info('Processing voice chat', { userId: req.user.id, audioSize: audioBuffer.length });
    const result = await handleVoiceChat({
      content: null,
      audioPath: audioBuffer,
      userId: req.user.id,
      userAgent: req.headers["user-agent"] || "",
      check: true,
    });

    assistantLogger.info('Voice chat processed successfully', { userId: req.user.id, intent: result?.intent });
    return res.status(200).json({
      intent: result?.intent ?? "unknown",
      reply: result?.reply ?? "",
      action: result?.action ?? null,
      platform: result?.platform ?? "unknown",
      user_text: result?.user_text ?? "",
    });
  } catch (error) {
    assistantLogger.error('Voice chat error', { error: error.message, stack: error.stack, userId: req.user.id });

    return res.status(500).json({
      error: "Voice assistant failed",
      intent: "error",
      reply: "Voice assistant failed",
      action: null,
      platform: "unknown",
    });
  }
};

export const speak = async (req, res) => {
  try {
    assistantLogger.info('TTS request received', { userId: req.user.id });
    const text = req.body?.text ?? req.body?.message ?? req.query?.text;

    if (!text) {
      assistantLogger.warn('No text provided for TTS', { userId: req.user.id });
      return res.status(400).json({
        error: "Text is required",
      });
    }

    assistantLogger.info('Generating speech', { userId: req.user.id, textLength: text.length });
    const audioBuffer = await handleGenerateSpeech(text);

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.length,
    });

    assistantLogger.info('Speech generated successfully', { userId: req.user.id, audioSize: audioBuffer.length });
    return res.send(audioBuffer);
  } catch (error) {
    assistantLogger.error('TTS error', { error: error.message, stack: error.stack, userId: req.user.id });

    return res.status(500).json({
      error: "TTS failed",
    });
  }
};

export const chat = async (req, res) => {
  try {
    assistantLogger.info('Chat request received', { userId: req.user.id });
    const text = req.body?.text ?? req.body?.message;
    if (!text) {
      assistantLogger.warn('No text provided for chat', { userId: req.user.id });
      return res.status(400).json({
        error: "Text is required",
      });
    }

    // Xử lý voice chat
    assistantLogger.info('Processing chat', { userId: req.user.id, textLength: text.length });
    const result = await handleVoiceChat({
      content: text,
      audioPath: null,
      userId: req.user.id,
      userAgent: req.headers["user-agent"] || "",
      check: false,
    });

    assistantLogger.info('Chat processed successfully', { userId: req.user.id, intent: result?.intent });
    return res.status(200).json({
      intent: result?.intent ?? "unknown",
      reply: result?.reply ?? "",
      action: result?.action ?? null,
      platform: result?.platform ?? "unknown",
      user_text: result?.user_text ?? "",
    });
  } catch (error) {
    assistantLogger.error('Chat error', { error: error.message, stack: error.stack, userId: req.user.id });

    return res.status(500).json({
      error: "Voice assistant failed",
      intent: "error",
      reply: "Voice assistant failed",
      action: null,
      platform: "unknown",
    });
  }
};
