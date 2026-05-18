import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";

import { convertWebmToWav } from "../utils/ffmpeg.js";

const sessions = new Map();

// Voice activity detection and audio processing configuration
const VOICE_CONFIG = {
  CHUNK_THRESHOLD: 4, // Process fewer chunks for lower latency
  SILENCE_THRESHOLD: 0.01, // Voice activity detection threshold
  MAX_CHUNK_SIZE: 1024 * 16, // Max chunk size (16KB)
  PROCESSING_TIMEOUT: 5000, // Timeout for audio processing
  RETRY_ATTEMPTS: 2, // Retry attempts for failed processing
};

// Audio buffer management for smooth processing
class AudioBuffer {
  constructor() {
    this.chunks = [];
    this.lastProcessTime = 0;
    this.totalSize = 0;
  }

  addChunk(chunk) {
    this.chunks.push(chunk);
    this.totalSize += chunk.length;
  }

  shouldProcess() {
    const now = Date.now();
    const timeSinceLastProcess = now - this.lastProcessTime;
    const hasEnoughChunks = this.chunks.length >= VOICE_CONFIG.CHUNK_THRESHOLD;
    const hasEnoughData = this.totalSize >= VOICE_CONFIG.MAX_CHUNK_SIZE;
    const timeThreshold = timeSinceLastProcess >= 1000; // Process at least every second

    return (
      (hasEnoughChunks || hasEnoughData || timeThreshold) && !this.isEmpty()
    );
  }

  getProcessedData() {
    const data = Buffer.concat(this.chunks);
    this.reset();
    return data;
  }

  reset() {
    this.chunks = [];
    this.lastProcessTime = Date.now();
    this.totalSize = 0;
  }

  isEmpty() {
    return this.chunks.length === 0;
  }
}

// Enhanced session management
class VoiceSession {
  constructor(socketId) {
    this.socketId = socketId;
    this.audioBuffer = new AudioBuffer();
    this.processing = false;
    this.startTime = Date.now();
    this.lastActivity = Date.now();
    this.retryCount = 0;
    this.connectionLost = false;
  }

  updateActivity() {
    this.lastActivity = Date.now();
  }

  isStale() {
    return Date.now() - this.lastActivity > 30000; // 30 seconds timeout
  }
}

export const registerVoiceSocket = (io, socket) => {
  const session = new VoiceSession(socket.id);
  sessions.set(socket.id, session);

  socket.on("voice:start", () => {
    console.log("Voice started:", socket.id);
    session.updateActivity();
    session.audioBuffer.reset();
    session.retryCount = 0;
    session.connectionLost = false;

    // Send acknowledgment to client
    socket.emit("voice:ready", { status: "ready", timestamp: Date.now() });
  });
  socket.on("voice:chunk", async (chunk) => {
    const session = sessions.get(socket.id);

    if (!session || session.connectionLost) return;

    try {
      // Validate chunk size
      if (chunk.length > VOICE_CONFIG.MAX_CHUNK_SIZE) {
        console.warn(`Chunk size too large: ${chunk.length} bytes`);
        return;
      }

      session.updateActivity();
      session.audioBuffer.addChunk(Buffer.from(chunk));

      console.log(
        "Chunks:",
        session.audioBuffer.chunks.length,
        "Total size:",
        session.audioBuffer.totalSize,
      );

      if (session.processing || !session.audioBuffer.shouldProcess()) {
        return;
      }

      session.processing = true;

      await processAudioChunk(io, socket, session);
    } catch (error) {
      console.error("Error handling voice chunk:", error);
      socket.emit("transcript:error", {
        error: "Lỗi xử lý audio chunk",
        timestamp: Date.now(),
      });
    } finally {
      session.processing = false;
    }
  });

  socket.on("voice:end", () => {
    console.log("Voice ended:", socket.id);

    const session = sessions.get(socket.id);
    if (session) {
      // Process any remaining audio chunks
      if (!session.audioBuffer.isEmpty() && !session.processing) {
        session.processing = true;
        processAudioChunk(io, socket, session).finally(() => {
          cleanupSession(socket.id);
          socket.emit("transcript:final", {
            text: "Kết thúc ghi âm",
            timestamp: Date.now(),
          });
        });
      } else {
        cleanupSession(socket.id);
        socket.emit("transcript:final", {
          text: "Kết thúc ghi âm",
          timestamp: Date.now(),
        });
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
    cleanupSession(socket.id);
  });

  socket.on("voice:ping", () => {
    // Heartbeat for connection health
    const session = sessions.get(socket.id);
    if (session) {
      session.updateActivity();
      socket.emit("voice:pong", { timestamp: Date.now() });
    }
  });
};

// Enhanced audio processing function
async function processAudioChunk(io, socket, session) {
  const startTime = Date.now();

  try {
    console.log("PROCESS REALTIME AUDIO - Session:", session.socketId);

    const audioBuffer = session.audioBuffer.getProcessedData();

    if (audioBuffer.length === 0) {
      console.log("Empty audio buffer, skipping processing");
      return;
    }

    const tempDir = path.join("temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const webmPath = path.join(
      tempDir,
      `${session.socketId}_${Date.now()}.webm`,
    );
    const wavPath = path.join(tempDir, `${session.socketId}_${Date.now()}.wav`);

    fs.writeFileSync(webmPath, audioBuffer);
    console.log("WEBM CREATED:", webmPath);

    // Add timeout for FFmpeg conversion
    await Promise.race([
      convertWebmToWav(webmPath, wavPath),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("FFmpeg conversion timeout")),
          VOICE_CONFIG.PROCESSING_TIMEOUT,
        ),
      ),
    ]);

    console.log("WAV CREATED:", wavPath);

    const form = new FormData();
    form.append("audio", fs.createReadStream(wavPath));

    console.log("SENDING TO WHISPER");

    // Add timeout for Whisper API call
    const response = await Promise.race([
      axios.post("http://localhost:5000/stt/transcribe", form, {
        headers: form.getHeaders(),
        timeout: VOICE_CONFIG.PROCESSING_TIMEOUT,
      }),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Whisper API timeout")),
          VOICE_CONFIG.PROCESSING_TIMEOUT,
        ),
      ),
    ]);

    console.log("WHISPER RESPONSE:", response.data);

    // Send partial transcript with metadata
    socket.emit("transcript:partial", {
      text: response.data.text || "",
      confidence: response.data.confidence || null,
      processingTime: Date.now() - startTime,
      timestamp: Date.now(),
    });

    // Reset retry count on successful processing
    session.retryCount = 0;
  } catch (error) {
    console.error("AUDIO PROCESSING ERROR:", error);

    session.retryCount++;

    if (session.retryCount <= VOICE_CONFIG.RETRY_ATTEMPTS) {
      console.log(`Retrying audio processing, attempt ${session.retryCount}`);
      // Put the data back in buffer for retry
      session.audioBuffer.addChunk(audioBuffer);
      socket.emit("transcript:retry", {
        attempt: session.retryCount,
        maxAttempts: VOICE_CONFIG.RETRY_ATTEMPTS,
        timestamp: Date.now(),
      });
    } else {
      socket.emit("transcript:error", {
        error: "Lỗi xử lý audio sau nhiều lần thử lại",
        retryCount: session.retryCount,
        timestamp: Date.now(),
      });
    }
  } finally {
    // Cleanup temporary files
    await cleanupTempFiles(webmPath, wavPath);
  }
}

// Cleanup function for temporary files
async function cleanupTempFiles(...filePaths) {
  for (const filePath of filePaths) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("Cleaned up:", filePath);
      }
    } catch (cleanupErr) {
      console.error("Cleanup error for", filePath, ":", cleanupErr);
    }
  }
}

// Session cleanup function
function cleanupSession(socketId) {
  try {
    const session = sessions.get(socketId);
    if (session) {
      console.log(
        `Cleaning up session: ${socketId}, duration: ${Date.now() - session.startTime}ms`,
      );
      sessions.delete(socketId);
    }
  } catch (err) {
    console.error("Session cleanup error:", err);
  }
}

// Periodic cleanup of stale sessions
setInterval(() => {
  const now = Date.now();
  for (const [socketId, session] of sessions.entries()) {
    if (session.isStale()) {
      console.log(`Removing stale session: ${socketId}`);
      sessions.delete(socketId);
    }
  }
}, 30000); // Check every 30 seconds
