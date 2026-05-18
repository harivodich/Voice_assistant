import {
  findUserById,
  updateUserProfile,
} from "../repository/userRepository.js";
import { logger, createChildLogger } from "../utils/logger.js";

const userLogger = createChildLogger({ module: 'user' });

function publicUserShape(user) {
  const profile = user.profile || {};
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    profile,
  };
}

export const getMe = async (req, res) => {
  try {
    userLogger.info('Get user profile request', { userId: req.user.id });
    return res.status(200).json(publicUserShape(req.user));
  } catch (error) {
    userLogger.error('Get user profile error', { error: error.message, stack: error.stack, userId: req.user.id });
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    userLogger.info('Update profile request', { userId: req.user.id });
    // nhận toàn bộ json gửi lên
    const profileData = req.body;

    // validate cơ bản
    if (
      !profileData ||
      typeof profileData !== "object" ||
      Array.isArray(profileData)
    ) {
      userLogger.warn('Invalid profile data', { userId: req.user.id, profileData });
      return res.status(400).json({
        message: "Profile data phải là JSON object",
      });
    }

    const updatedProfile = await updateUserProfile(req.user.id, profileData);

    const user = await findUserById(req.user.id, {
      attributes: { exclude: ["hashedPassword"] },
    });

    userLogger.info('Profile updated successfully', { userId: req.user.id });
    return res.status(200).json({
      message: "Cập nhật profile thành công",
      user: publicUserShape(user),
    });
  } catch (error) {
    userLogger.error('Update profile error', { error: error.message, stack: error.stack, userId: req.user.id });

    return res.status(500).json({
      message: "Lỗi hệ thống",
    });
  }
};
