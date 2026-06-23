import type { ErrorRequestHandler } from "express";
import { isProd } from "../config/env.js";
import { logger } from "../config/logger.js";
import { ERROR_MESSAGES } from "../constants/ERROR_MESSAGES.js";
import { HTTP_STATUS } from "../constants/HTTP_STATUS.js";
import { ApiError } from "../utils/ApiError.js";

export const errorMiddleware: ErrorRequestHandler = (err, req, res, _next) => {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = isApiError ? err.message : ERROR_MESSAGES.INTERNAL_SERVER_ERROR;

  logger.error({ err, path: req.originalUrl }, message);

  res.status(statusCode).json({
    success: false,
    message,
    ...(isApiError && err.details ? { details: err.details } : {}),
    ...(!isProd && !isApiError ? { stack: (err as Error).stack } : {}),
  });
};
