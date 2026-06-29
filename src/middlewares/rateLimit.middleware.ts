import type { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { ERROR_MESSAGES } from "../constants/ERROR_MESSAGES.js";
import { HTTP_STATUS } from "../constants/HTTP_STATUS.js";

const handler = (_req: Request, res: Response): void => {
  res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
    success: false,
    message: ERROR_MESSAGES.TOO_MANY_REQUESTS,
  });
};

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});
