import jwt from "jsonwebtoken";
import { findUserByEmail } from "../repository/userRepository.js";
import { env } from "../utils/env.js";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Unauthorized - Token không tồn tại"));
    }

    const decoded = jwt.verify(token, env.jwtSecret);
    if (!decoded) {
      return next(
        new Error("Unauthorized - Token không hợp lệ hoặc đã hết hạn"),
      );
    }

    const user = await findUserByEmail(decoded.userId).select(
      "-hashedPassword",
    );

    if (!user) {
      return next(new Error("User không tồn tại"));
    }

    socket.user = user;

    next();
  } catch (error) {
    console.error("Lỗi khi verify JWT trong socketMiddleware", error);
    next(new Error("Unauthorized"));
  }
};
