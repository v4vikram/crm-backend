import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { HTTP_STATUS } from "../constants/HTTP_STATUS.js";
import { ERROR_MESSAGES } from "../constants/ERROR_MESSAGES.js";
import { ApiError } from "../utils/ApiError.js";

interface ValidatedShape {
  body?: unknown;
  query?: unknown;
  params?: unknown;
}

export const validate =
  <T extends ZodType<ValidatedShape>>(schema: T) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      next(
        new ApiError(
          HTTP_STATUS.UNPROCESSABLE_ENTITY,
          ERROR_MESSAGES.VALIDATION_ERROR,
          result.error.issues,
        ),
      );
      return;
    }

    if (result.data.body !== undefined) req.body = result.data.body;
    if (result.data.query !== undefined) req.query = result.data.query as Request["query"];
    next();
  };