import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../utils/env.js";
import { createUser, findUserByEmail } from "../repository/userRepository.js";
import { createChildLogger } from "../utils/logger.js";

const authLogger = createChildLogger({ module: 'auth-service' });

class AuthError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

function signAccessToken(userId) {
  return jwt.sign({ userId: String(userId) }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
}

export async function registerUser({ name, email, password }) {
  authLogger.info('Registering user', { email });
  if (!name || !email || !password) {
    authLogger.warn('Missing required fields', { email, hasName: !!name, hasPassword: !!password });
    throw new AuthError("Thiếu dữ liệu (name, email, password).", 400);
  }
  if (typeof password !== "string" || password.length < 6) {
    authLogger.warn('Invalid password length', { email, passwordLength: password?.length });
    throw new AuthError("Mật khẩu tối thiểu 6 ký tự.", 400);
  }

  const existed = await findUserByEmail(email);
  if (existed) {
    authLogger.warn('Email already exists', { email });
    throw new AuthError("Email đã được sử dụng.", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await createUser({
    name,
    email,
    hashedPassword,
    profile: { name: name },
  });
  const accessToken = signAccessToken(user.id);

  authLogger.info('User registered successfully', { userId: user.id, email });
  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      profile: user.profile,
    },
  };
}

export async function loginUser({ email, password }) {
  authLogger.info('User login attempt', { email });
  if (!email || !password) {
    authLogger.warn('Missing credentials', { email, hasPassword: !!password });
    throw new AuthError("Thiếu dữ liệu (email, password).", 400);
  }

  const user = await findUserByEmail(email);
  if (!user) {
    authLogger.warn('User not found', { email });
    throw new AuthError("Email hoặc mật khẩu không đúng.", 401);
  }

  const ok = await bcrypt.compare(password, user.hashedPassword);
  if (!ok) {
    authLogger.warn('Invalid password', { email });
    throw new AuthError("Email hoặc mật khẩu không đúng.", 401);
  }

  const accessToken = signAccessToken(user.id);
  authLogger.info('User logged in successfully', { userId: user.id, email });
  return {
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      profile: user.profile,
    },
  };
}

export function isAuthError(err) {
  return err instanceof AuthError && typeof err.statusCode === "number";
}
