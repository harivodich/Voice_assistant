/**
 * Đường dẫn API khớp backend (Express) — tham chiếu Swagger / server.js
 */
export const paths = {
  health: "/health",

  auth: {
    register: "/api/auth/register",
    login: "/api/auth/login",
    logout: "/api/auth/logout",
  },

  user: {
    me: "/api/user/me",
    profile: "/api/user/profile",
  },

  assistant: {
    chat: "/api/assistant/chat",
    voiceChat: "/api/assistant/voice-chat",
    speak: "/api/assistant/speak",
  },

  history: {
    list: "/api/history",
  },

  reminders: {
    acknowledge: (id) => `/api/reminders/${id}/acknowledge`,
  },
};
