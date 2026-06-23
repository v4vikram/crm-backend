import type { Request, Response } from "express";
import { ERROR_MESSAGES } from "../../constants/ERROR_MESSAGES.js";
import { HTTP_STATUS } from "../../constants/HTTP_STATUS.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { changePassword, listUsers, updateProfile } from "./user.service.js";
import type { ListUsersQuery } from "./user.types.js";

export const updateProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
  }

  const user = await updateProfile(req.user.id, req.body);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, "Profile updated successfully", user));
});

export const changePasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
  }

  await changePassword(req.user.id, req.body);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, "Password updated successfully"));
});

export const listUsersHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await listUsers(req.query as unknown as ListUsersQuery);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, "Users fetched successfully", result));
});
