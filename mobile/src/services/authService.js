import axios from 'axios';
import BASE_URL from './apiConfig';

const API_URL = `${BASE_URL}/api/auth`;

const authService = {
  login: async (email, password) => {
    try {
      console.log(`Đang kết nối tới: ${API_URL}/login`);
      const response = await axios.post(`${API_URL}/login`, {
        email: email.trim(),
        password: password
      });
      return response.data;
    } catch (error) {
      console.error('Chi tiết lỗi login:', error);
      if (error.response) {
        throw error.response.data;
      }
      throw { message: 'Không thể kết nối tới Server. Kiểm tra IP/Wifi hoặc Firewall.' };
    }
  },

  register: async (email, password, name) => {
    try {
      const response = await axios.post(`${API_URL}/register`, {
        email: email.trim(),
        password,
        name
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw error.response.data;
      }
      throw { message: 'Không thể kết nối tới Server' };
    }
  }
};

export default authService;
