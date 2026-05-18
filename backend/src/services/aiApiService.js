import axios from "axios";
import FormData from "form-data";
import { env } from "../utils/env.js";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { PassThrough } from "stream";

const PYTHON_API = env.aiServiceBaseUrl;

// ===== INTENT =====
export const predictIntent = async (text) => {
  try {
    const response = await axios.post(`${PYTHON_API}/intent/predict`, {
      text,
    });

    return response.data.intent;
  } catch (error) {
    console.error("[INTENT API ERROR]:", error.message);

    return "unknown";
  }
};

// ===== FAQ =====
export const retrieveFAQ = async (query) => {
  try {
    const response = await axios.post(`${PYTHON_API}/faq`, {
      query,
    });

    return response.data.intent;
  } catch (error) {
    console.error("[FAQ API ERROR]:", error.message);

    return null;
  }
};

// ===== TTS =====
export const generateSpeech = async (text) => {
  const response = await axios.post(
    `${PYTHON_API}/tts/speak`,
    { text },
    {
      responseType: "arraybuffer",
    },
  );

  return response.data;
};

// ===== STT =====
ffmpeg.setFfmpegPath(ffmpegPath);

const convertWebmToWavBuffer = (inputBuffer) => {
  return new Promise((resolve, reject) => {
    const inputStream = new PassThrough();
    inputStream.end(inputBuffer);

    const outputStream = new PassThrough();

    const chunks = [];

    outputStream.on("data", (chunk) => {
      chunks.push(chunk);
    });

    outputStream.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    ffmpeg(inputStream)
      .inputFormat("webm")
      .audioFrequency(16000)
      .audioChannels(1)
      .audioCodec("pcm_s16le")
      .format("wav")
      .on("error", reject)
      .pipe(outputStream, { end: true });
  });
};

export const transcribe = async (audioBuffer) => {
  const wavBuffer = await convertWebmToWavBuffer(audioBuffer);

  const formData = new FormData();

  formData.append("audio", wavBuffer, {
    filename: "recording.wav",
    contentType: "audio/wav",
  });

  const response = await axios.post(`${PYTHON_API}/stt/transcribe`, formData, {
    headers: formData.getHeaders(),
    maxBodyLength: Infinity,
  });

  return response.data.text;
};
