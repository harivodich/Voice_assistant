import { Linking, Alert } from 'react-native';

/**
 * Xử lý việc mở link hoặc ứng dụng từ action của backend
 * @param {Object} action Đối tượng action từ response của backend
 */
export const handleAction = async (action) => {
  if (!action || action.type !== 'open') return;

  const { deepLink, url, fallback } = action;

  try {
    // 1. Thử mở bằng Deep Link (App) nếu có
    if (deepLink) {
      const canOpen = await Linking.canOpenURL(deepLink);
      if (canOpen) {
        await Linking.openURL(deepLink);
        return;
      }
    }

    // 2. Nếu không mở được App, thử mở Web URL
    if (url) {
      await Linking.openURL(url);
      return;
    }

    // 3. Nếu vẫn không được, thử fallback
    if (fallback && fallback.url) {
      await Linking.openURL(fallback.url);
    }
  } catch (error) {
    console.error('Lỗi điều hướng:', error);

    if (url && !url.includes(deepLink)) {
        Linking.openURL(url).catch(() => {
            Linking.openURL('https://www.google.com');
        });
    }
  }
};
