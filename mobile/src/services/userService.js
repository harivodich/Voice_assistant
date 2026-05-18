import axios from 'axios';
import BASE_URL from './apiConfig';

const API_URL = `${BASE_URL}/api/user`;

const userService = {
  getMe: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      if (error.response) throw error.response.data;
      throw { message: 'Không thể kết nối tới Server' };
    }
  },

  updateProfile: async (profileData, token) => {
    try {
      const response = await axios.patch(`${API_URL}/profile`, profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      if (error.response) throw error.response.data;
      throw { message: 'Không thể cập nhật thông tin' };
    }
  }
};

export default userService;
