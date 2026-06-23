import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { APP_CONSTANTS } from "../../constants/APP_CONSTANTS.js";
import { ERROR_MESSAGES } from "../../constants/ERROR_MESSAGES.js";
import { HTTP_STATUS } from "../../constants/HTTP_STATUS.js";
import type { Role } from "../../constants/ROLES.js";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/ApiError.js";
import { createUser, findUserByEmail, findUserById } from "./auth.repository.js";
import type {
  AuthTokens,
  JwtPayload,
  LoginDto,
  RegisterDto,
  SafeUser,
} from "./auth.types.js";

export const toSafeUser = (user: { id: string; name: string; email: string; role: Role }): SafeUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
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

export const register = async (
  dto: RegisterDto,
): Promise<{ user: SafeUser; tokens: AuthTokens }> => {
  const existing = await findUserByEmail(dto.email);
  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(dto.password, APP_CONSTANTS.BCRYPT_SALT_ROUNDS);
  const user = await createUser({ name: dto.name, email: dto.email, passwordHash });

  const safeUser = toSafeUser(user);
  const tokens = generateTokens({ sub: user.id, email: user.email, role: safeUser.role });

  return { user: safeUser, tokens };
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