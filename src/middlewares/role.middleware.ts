import type { NextFunction, Request, Response } from "express";
import { ERROR_MESSAGES } from "../constants/ERROR_MESSAGES.js";
import { HTTP_STATUS } from "../constants/HTTP_STATUS.js";
import type { Role } from "../constants/ROLES.js";
import { ApiError } from "../utils/ApiError.js";

export const requireRole =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new ApiError(HTTP_STATUS.FORBIDDEN, ERROR_MESSAGES.FORBIDDEN));
      return;
    }

    next();
  };