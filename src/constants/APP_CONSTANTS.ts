import { isProd } from "../config/env.js";

export const APP_CONSTANTS = {
  APP_NAME: "CRM",
  BCRYPT_SALT_ROUNDS: 10,
  ACCESS_TOKEN_EXPIRY: "15m",
  REFRESH_TOKEN_EXPIRY: "7d",
  REFRESH_TOKEN_COOKIE: "refreshToken",
  PASSWORD_RESET_TOKEN_TTL_MINUTES: 15,
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
} as const;

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: "strict",
} as const;