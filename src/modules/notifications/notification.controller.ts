import type { Request, Response } from "express";
import { ERROR_MESSAGES } from "../../constants/ERROR_MESSAGES.js";
import { HTTP_STATUS } from "../../constants/HTTP_STATUS.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getUnreadCount,
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "./notification.service.js";
import type { ListNotificationsQuery } from "./notification.types.js";

const requireUserId = (req: Request): string => {
  if (!req.user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
  }
  return req.user.id;
};

export const listNotificationsHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const result = await listNotifications(userId, req.query as unknown as ListNotificationsQuery);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, "Notifications fetched successfully", result));
});

export const unreadCountHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  const count = await getUnreadCount(userId);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, "Unread count fetched successfully", { count }));
});

export const markReadHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  await markNotificationAsRead(req.params.id as string, userId);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, "Notification marked as read"));
});

export const markAllReadHandler = asyncHandler(async (req: Request, res: Response) => {
  const userId = requireUserId(req);
  await markAllNotificationsAsRead(userId);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, "All notifications marked as read"));
});
