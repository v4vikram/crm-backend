import type { Request, Response } from "express";
import { ERROR_MESSAGES } from "../../constants/ERROR_MESSAGES.js";
import { HTTP_STATUS } from "../../constants/HTTP_STATUS.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getDashboardInsight, getSalesPerformanceAnalysis } from "./ai.service.js";

export const getDashboardInsightHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
  }

  const insight = await getDashboardInsight({ userId: req.user.id, role: req.user.role });
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, "Dashboard insight generated", insight));
});

export const getSalesPerformanceHandler = asyncHandler(async (_req: Request, res: Response) => {
  const analysis = await getSalesPerformanceAnalysis();
  res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, "Sales performance analysis generated", analysis));
});
