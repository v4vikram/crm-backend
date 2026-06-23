import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { changePasswordHandler, updateProfileHandler } from "./user.controller.js";
import { changePasswordSchema, updateProfileSchema } from "./user.validation.js";

export const userRoutes = Router();

userRoutes.use(authMiddleware);
userRoutes.patch("/profile", validate(updateProfileSchema), updateProfileHandler);
userRoutes.patch("/profile/password", validate(changePasswordSchema), changePasswordHandler);
