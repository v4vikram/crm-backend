import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { APP_CONSTANTS } from "../../constants/APP_CONSTANTS.js";
import { ERROR_MESSAGES } from "../../constants/ERROR_MESSAGES.js";
import { HTTP_STATUS } from "../../constants/HTTP_STATUS.js";
import type { Role } from "../../constants/ROLES.js";
import { env } from "../../config/env.js";
import { sendPasswordResetEmail } from "../../lib/mailer.js";
import { ApiError } from "../../utils/ApiError.js";
import {
  clearPasswordResetToken,
  findUserByEmail,
  findUserByResetToken,
  findUserById,
  setPasswordResetToken,
  updateUserPassword,
} from "./auth.repository.js";
import type {
  AuthTokens,
  ForgotPasswordDto,
  JwtPayload,
  LoginDto,
  ResetPasswordDto,
  SafeUser,
} from "./auth.types.js";

export const toSafeUser = (user: {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
}): SafeUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

const generateTokens = (payload: JwtPayload): AuthTokens => {
  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: APP_CONSTANTS.ACCESS_TOKEN_EXPIRY,
  });
  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: APP_CONSTANTS.REFRESH_TOKEN_EXPIRY,
  });
  return { accessToken, refreshToken };
};

export const login = async (
  dto: LoginDto,
): Promise<{ user: SafeUser; tokens: AuthTokens }> => {
  const user = await findUserByEmail(dto.email);
  if (!user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
  }

  const isValid = await bcrypt.compare(dto.password, user.passwordHash);
  if (!isValid) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
  }

  const safeUser = toSafeUser(user);
  const tokens = generateTokens({ sub: user.id, email: user.email, role: safeUser.role });

  return { user: safeUser, tokens };
};

export const refreshAccessToken = async (refreshToken: string): Promise<AuthTokens> => {
  let payload: JwtPayload;
  try {
    payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as JwtPayload;
  } catch {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
  }

  const user = await findUserById(payload.sub);
  if (!user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
  }

  return generateTokens({ sub: user.id, email: user.email, role: user.role });
};

const hashToken = (token: string): string => crypto.createHash("sha256").update(token).digest("hex");

export const requestPasswordReset = async (dto: ForgotPasswordDto): Promise<void> => {
  const user = await findUserByEmail(dto.email);
  if (!user) {
    return;
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + APP_CONSTANTS.PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000);
  await setPasswordResetToken(user.id, hashToken(rawToken), expiresAt);

  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${rawToken}`;
  await sendPasswordResetEmail(user.email, resetUrl);
};

export const resetPassword = async (dto: ResetPasswordDto): Promise<void> => {
  const user = await findUserByResetToken(hashToken(dto.token));
  if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Invalid or expired reset token");
  }

  const passwordHash = await bcrypt.hash(dto.newPassword, APP_CONSTANTS.BCRYPT_SALT_ROUNDS);
  await updateUserPassword(user.id, passwordHash);
  await clearPasswordResetToken(user.id);
};