import { io } from "socket.io-client";

class VoiceSocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.heartbeatInterval = null;
    this.connectionCallbacks = new Set();
  }

  connect() {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    this.socket = io("/", {
      transports: ["websocket"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventListeners();
    return this.socket;
  }

  setupEventListeners() {
    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.notifyCallbacks("connect", { connected: true });
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      this.isConnected = false;
      this.stopHeartbeat();
      this.notifyCallbacks("disconnect", { reason });
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("Socket reconnected after", attemptNumber, "attempts");
      this.isConnected = true;
      this.startHeartbeat();
      this.notifyCallbacks("reconnect", { attemptNumber });
    });

    this.socket.on("reconnect_error", (error) => {
      console.error("Socket reconnection error:", error);
      this.reconnectAttempts++;
      this.notifyCallbacks("reconnect_error", {
        error,
        attempt: this.reconnectAttempts,
      });
    });

    this.socket.on("voice:ready", (data) => {
      console.log("Voice service ready:", data);
      this.notifyCallbacks("voice:ready", data);
    });

    this.socket.on("voice:pong", (data) => {
      console.log("Heartbeat response:", data);
      this.notifyCallbacks("voice:pong", data);
    });

    this.socket.on("transcript:retry", (data) => {
      console.log("Transcript retry:", data);
      this.notifyCallbacks("transcript:retry", data);
    });

    this.socket.on("transcript:error", (data) => {
      console.error("Transcript error:", data);
      this.notifyCallbacks("transcript:error", data);
    });
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.socket) {
        this.socket.emit("voice:ping");
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  on(event, callback) {
    this.connectionCallbacks.add({ event, callback });

    if (this.socket) {
      this.socket.on(event, callback);
    }

    return () => this.off(event, callback);
  }

  off(event, callback) {
    this.connectionCallbacks.forEach((item, index) => {
      if (item.event === event && item.callback === callback) {
        this.connectionCallbacks.delete(index);
      }
    });

    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      return this.socket.emit(event, data);
    }
    console.warn("Socket not connected, cannot emit:", event);
    return false;
  }

  notifyCallbacks(event, data) {
    this.connectionCallbacks.forEach(({ event: callbackEvent, callback }) => {
      if (callbackEvent === event) {
        try {
          callback(data);
        } catch (error) {
          console.error("Error in socket callback:", error);
        }
      }
    });
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.connectionCallbacks.clear();
  }
}

// Create singleton instance
const voiceSocketManager = new VoiceSocketManager();

// Export the socket instance for backward compatibility
export const socket = voiceSocketManager.connect();

// Export the manager for advanced usage
export { voiceSocketManager };

// Export convenience methods
export const on = (event, callback) => voiceSocketManager.on(event, callback);
export const emit = (event, data) => voiceSocketManager.emit(event, data);
export const disconnect = () => voiceSocketManager.disconnect();
