import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";
import { randomUUID } from "crypto";

import { convertWebmToWav } from "../utils/ffmpeg.js";
import { createChildLogger } from "../utils/logger.js";

const voiceLogger = createChildLogger({ module: 'voice-socket' });

const sessions = new Map();

const VOICE_CONFIG = {
  CHUNK_THRESHOLD: 4,
  MAX_CHUNK_SIZE: 1024 * 16,
  PROCESSING_TIMEOUT: 8000,
  RETRY_ATTEMPTS: 2,
};

// ---------------- BUFFER ----------------
class AudioBuffer {
  constructor() {
    this.chunks = [];
    this.totalSize = 0;
    this.lastProcessTime = Date.now();
  }

  addChunk(chunk) {
    this.chunks.push(chunk);
    this.totalSize += chunk.length;
  }

  shouldProcess() {
    const now = Date.now();
    const timeOK = now - this.lastProcessTime > 2000; // FIX: avoid too fast ffmpeg
    const chunkOK = this.chunks.length >= VOICE_CONFIG.CHUNK_THRESHOLD;
    const sizeOK = this.totalSize >= VOICE_CONFIG.MAX_CHUNK_SIZE;

    return (timeOK || chunkOK || sizeOK) && this.chunks.length > 0;
  }

  getBuffer() {
    return Buffer.concat(this.chunks);
  }

  reset() {
    this.chunks = [];
    this.totalSize = 0;
    this.lastProcessTime = Date.now();
  }
}

// ---------------- SESSION ----------------
class VoiceSession {
  constructor(id) {
    this.id = id;
    this.buffer = new AudioBuffer();
    this.processing = false;
    this.retryCount = 0;

    // IMPORTANT: queue to avoid race condition
    this.queue = Promise.resolve();
  }

  enqueue(task) {
    this.queue = this.queue.then(task).catch((err) => {
      voiceLogger.error('Queue error', { error: err.message, stack: err.stack, sessionId: this.id });
    });
    return this.queue;
  }
}

// ---------------- SOCKET ----------------
export const registerVoiceSocket = (io, socket) => {
  const session = new VoiceSession(socket.id);
  sessions.set(socket.id, session);
  voiceLogger.info('Voice session created', { socketId: socket.id });

  socket.on("voice:start", () => {
    voiceLogger.info('Voice started', { socketId: socket.id });
    session.buffer.reset();
    session.retryCount = 0;
  });

  socket.on("voice:chunk", (chunk) => {
    const s = sessions.get(socket.id);
    if (!s) return;

    s.buffer.addChunk(Buffer.from(chunk));

    if (s.processing || !s.buffer.shouldProcess()) return;

    s.processing = true;

    s.enqueue(() =>
      processAudio(io, socket, s).finally(() => {
        s.processing = false;
      }),
    );
  });

  socket.on("voice:end", () => {
    voiceLogger.info('Voice ended', { socketId: socket.id });
    const s = sessions.get(socket.id);
    if (!s) return;

    if (!s.processing && s.buffer.chunks.length > 0) {
      s.processing = true;

      s.enqueue(() =>
        processAudio(io, socket, s).finally(() => {
          cleanupSession(socket.id);
        }),
      );
    } else {
      cleanupSession(socket.id);
    }
  });

  socket.on("disconnect", () => {
    voiceLogger.info('Voice socket disconnected', { socketId: socket.id });
    cleanupSession(socket.id);
  });
};

// ---------------- CORE PROCESS ----------------
async function processAudio(io, socket, session) {
  const start = Date.now();

  let webmPath;
  let wavPath;
  let audioBuffer;

  try {
    audioBuffer = session.buffer.getBuffer();

    if (!audioBuffer.length) return;

    voiceLogger.info('Processing audio', { socketId: socket.id, audioSize: audioBuffer.length });
    const tempDir = "temp";
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const id = randomUUID();

    webmPath = path.join(tempDir, `${session.id}_${id}.webm`);
    wavPath = path.join(tempDir, `${session.id}_${id}.wav`);

    fs.writeFileSync(webmPath, audioBuffer);

    voiceLogger.info('WEBM file created', { socketId: socket.id, webmPath });

    await Promise.race([
      convertWebmToWav(webmPath, wavPath),
      timeout(VOICE_CONFIG.PROCESSING_TIMEOUT, "FFmpeg timeout"),
    ]);

    voiceLogger.info('WAV file created', { socketId: socket.id, wavPath });

    const form = new FormData();
    form.append("audio", fs.createReadStream(wavPath));

    const response = await Promise.race([
      axios.post("http://localhost:5000/stt/transcribe", form, {
        headers: form.getHeaders(),
        timeout: VOICE_CONFIG.PROCESSING_TIMEOUT,
      }),
      timeout(VOICE_CONFIG.PROCESSING_TIMEOUT, "Whisper timeout"),
    ]);

    voiceLogger.info('Whisper response received', { socketId: socket.id, text: response.data.text });

    socket.emit("transcript:partial", {
      text: response.data.text || "",
      confidence: response.data.confidence || null,
      processingTime: Date.now() - start,
    });

    voiceLogger.info('Transcript emitted', { socketId: socket.id, processingTime: Date.now() - start });
    // SUCCESS → reset buffer
    session.buffer.reset();
    session.retryCount = 0;
  } catch (err) {
    voiceLogger.error('Audio processing error', { error: err.message, stack: err.stack, socketId: socket.id });

    session.retryCount++;

    if (session.retryCount <= VOICE_CONFIG.RETRY_ATTEMPTS) {
      voiceLogger.info('Retrying audio processing', { socketId: socket.id, attempt: session.retryCount });

      socket.emit("transcript:retry", {
        attempt: session.retryCount,
      });

      // IMPORTANT: DO NOT reset buffer on retry
      return;
    }

    voiceLogger.error('Audio processing failed after retries', { socketId: socket.id, retryCount: session.retryCount });
    socket.emit("transcript:error", {
      error: "Processing failed after retries",
    });
  } finally {
    await cleanup(webmPath, wavPath);
  }
}

// ---------------- HELPERS ----------------
function timeout(ms, msg) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error(msg)), ms),
  );
}

async function cleanup(...files) {
  for (const f of files) {
    try {
      if (f && fs.existsSync(f)) {
        fs.unlinkSync(f);
        voiceLogger.info('File cleaned up', { filePath: f });
      }
    } catch (e) {
      voiceLogger.error('Cleanup error', { error: e.message, filePath: f });
    }
  }
}

function cleanupSession(id) {
  const s = sessions.get(id);
  if (s) {
    voiceLogger.info('Session cleaned up', { sessionId: id });
    sessions.delete(id);
  }
}
