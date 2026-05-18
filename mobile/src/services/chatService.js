import axios from "axios";
import { Platform } from "react-native";
import BASE_URL from "./apiConfig";

const API_URL = `${BASE_URL}/api/assistant`;

const chatService = {
  sendMessage: async (message, token) => {
    try {
      const response = await axios.post(
        `${API_URL}/chat`,
        { message, platform: "mobile" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        throw error.response.data;
      }
      throw { message: "Không thể kết nối tới Server" };
    }
  },

  sendVoiceMessage: async (audioUri, token) => {
    try {
      const formData = new FormData();

      // Xử lý URI cho Android (cần prefix file:// nếu chưa có)

      const uri =
        Platform.OS === "android" && !audioUri.startsWith("file://")
          ? `file://${audioUri}`
          : audioUri;

      formData.append("audio", {
        uri: uri,
        type: "audio/m4a",
        name: "audio.m4a",
      });

      formData.append("platform", "mobile");

      const response = await axios.post(`${API_URL}/voice-chat`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw error.response.data;
      }
      throw { message: "Không thể xử lý giọng nói" };
    }
  },

  getSpeechUrl: () => {
    return `${API_URL}/speak`;
  },

  getHistory: async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw error.response.data;
      }
      throw { message: "Không thể tải lịch sử trò chuyện" };
    }
  },

  checkDueReminders: async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/reminders/due`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return [];
    }
  },

  acknowledgeReminder: async (id, token) => {
    try {
      await axios.post(
        `${BASE_URL}/api/reminders/${id}/acknowledge`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return true;
    } catch (error) {
      return false;
    }
  },
};

export default chatService;
