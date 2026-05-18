import {
  isAuthError,
  loginUser,
  registerUser,
} from "../services/authService.js";
import { logger, createChildLogger } from "../utils/logger.js";

const authLogger = createChildLogger({ module: 'auth' });

export const register = async (req, res) => {
  try {
    authLogger.info('User registration attempt', { email: req.body?.email });
    const { accessToken, user } = await registerUser(req.body ?? {});
    authLogger.info('User registered successfully', { userId: user.id, email: user.email });
    return res.status(201).json({
      message: "Đăng ký thành công.",
      accessToken,
      user,
    });
  } catch (error) {
    if (isAuthError(error)) {
      authLogger.warn('Registration failed', { error: error.message, email: req.body?.email });
      return res.status(error.statusCode).json({ message: error.message });
    }
    authLogger.error('Registration error', { error: error.message, stack: error.stack });
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const login = async (req, res) => {
  try {
    authLogger.info('User login attempt', { email: req.body?.email });
    const { accessToken, user } = await loginUser(req.body ?? {});
    authLogger.info('User logged in successfully', { userId: user.id, email: user.email });
    return res.status(200).json({
      message: "Đăng nhập thành công.",
      accessToken,
      user,
    });
  } catch (error) {
    if (isAuthError(error)) {
      authLogger.warn('Login failed', { error: error.message, email: req.body?.email });
      return res.status(error.statusCode).json({ message: error.message });
    }
    authLogger.error('Login error', { error: error.message, stack: error.stack });
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

export const logout = async (req, res) => {
  try {
    authLogger.info('User logout attempt', { userId: req.user?.id });
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.clearCookie("token");
    authLogger.info('User logged out successfully', { userId: req.user?.id });
    return res.status(200).json({ message: "Đăng xuất thành công." });
  } catch (error) {
    authLogger.error('Logout error', { error: error.message, stack: error.stack });
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
