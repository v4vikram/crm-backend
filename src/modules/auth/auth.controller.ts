import type { Request, Response } from "express";
import { APP_CONSTANTS, COOKIE_OPTIONS } from "../../constants/APP_CONSTANTS.js";
import { ERROR_MESSAGES } from "../../constants/ERROR_MESSAGES.js";
import { HTTP_STATUS } from "../../constants/HTTP_STATUS.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { findUserById } from "./auth.repository.js";
import {
  login,
  refreshAccessToken,
  requestPasswordReset,
  resetPassword,
  toSafeUser,
} from "./auth.service.js";
import type { AuthTokens } from "./auth.types.js";

const setRefreshCookie = (res: Response, tokens: AuthTokens): void => {
  res.cookie(APP_CONSTANTS.REFRESH_TOKEN_COOKIE, tokens.refreshToken, COOKIE_OPTIONS);
};

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const { user, tokens } = await login(req.body);
  setRefreshCookie(res, tokens);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, "Logged in successfully", { user, accessToken: tokens.accessToken }));
});

export const refreshHandler = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[APP_CONSTANTS.REFRESH_TOKEN_COOKIE];
  if (!refreshToken) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Missing refresh token");
  }

  const tokens = await refreshAccessToken(refreshToken);
  setRefreshCookie(res, tokens);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, "Token refreshed", { accessToken: tokens.accessToken }));
});

export const logoutHandler = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(APP_CONSTANTS.REFRESH_TOKEN_COOKIE, COOKIE_OPTIONS);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, "Logged out successfully"));
});

export const forgotPasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  await requestPasswordReset(req.body);
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, "If that email exists, a reset link has been sent"));
});

export const resetPasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  await resetPassword(req.body);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, "Password reset successfully"));
});

export const meHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
  }

  const user = await findUserById(req.user.id);
  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, "Current user", toSafeUser(user)));
});