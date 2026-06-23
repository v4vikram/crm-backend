import type { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "../constants/HTTP_STATUS.js";
import { ApiError } from "../utils/ApiError.js";

export const notFoundMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  next(new ApiError(HTTP_STATUS.NOT_FOUND, `Route ${req.originalUrl} not found`));
};
