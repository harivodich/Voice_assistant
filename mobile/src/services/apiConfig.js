import { Platform } from 'react-native';

/**
 * QUAN TRỌNG:
 * Vì bạn đang dùng một địa chỉ IP cụ thể (backend server),
 * chúng ta sẽ dùng chung IP này cho tất cả các nền tảng.
 */

// THAY ĐỔI TẠI ĐÂY:
const YOUR_SERVER_IP = '160.250.181.234';

const BASE_URL = Platform.select({
  ios: `http://${YOUR_SERVER_IP}:3000`,
  android: `http://${YOUR_SERVER_IP}:3000`,
  default: `http://${YOUR_SERVER_IP}:3000`,
});

export default BASE_URL;