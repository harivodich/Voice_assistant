// @ts-nocheck
import jwt from "jsonwebtoken";
import { env } from "../utils/env.js";
import { findUserById } from "../repository/userRepository.js";
import { createChildLogger } from "../utils/logger.js";

const authLogger = createChildLogger({ module: 'auth-middleware' });

// authorization - xác minh user là ai
export const protectedRoute = (req, res, next) => {
  try {
    // lấy token từ header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      authLogger.warn('No access token provided', { path: req.path });
      return res.status(401).json({ message: "Không tìm thấy access token" });
    }

    // xác nhận token hợp lệ
    jwt.verify(token, env.jwtSecret, async (err, decodedUser) => {
      if (err) {
        authLogger.warn('Invalid or expired token', { error: err.message, path: req.path });

        return res
          .status(403)
          .json({ message: "Access token hết hạn hoặc không đúng" });
      }

      try {
        const user = await findUserById(decodedUser.userId, {
          attributes: { exclude: ["hashedPassword"] },
        });
        req.user = user;
        authLogger.info('User authenticated successfully', { userId: user.id, path: req.path });
        next();
      } catch (error) {
        authLogger.warn('User not found', { userId: decodedUser.userId, error: error.message });
        return res.status(404).json({ message: "người dùng không tồn tại." });
      }
    });
  } catch (error) {
    authLogger.error('JWT verification error', { error: error.message, stack: error.stack, path: req.path });
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};
