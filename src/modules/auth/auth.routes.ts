import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { authLimiter } from "../../middlewares/rateLimit.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  forgotPasswordHandler,
  loginHandler,
  logoutHandler,
  meHandler,
  refreshHandler,
  resetPasswordHandler,
} from "./auth.controller.js";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
} from "./auth.validation.js";

export const authRoutes = Router();

authRoutes.post("/login", authLimiter, validate(loginSchema), loginHandler);
authRoutes.post("/refresh", authLimiter, refreshHandler);
authRoutes.post("/logout", logoutHandler);
authRoutes.post(
  "/forgot-password",
  authLimiter,
  validate(forgotPasswordSchema),
  forgotPasswordHandler,
);
authRoutes.post(
  "/reset-password",
  authLimiter,
  validate(resetPasswordSchema),
  resetPasswordHandler,
);
authRoutes.get("/me", authMiddleware, meHandler);
