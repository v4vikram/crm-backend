import { Router } from "express";
import { ROLES } from "../../constants/ROLES.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  changePasswordHandler,
  listAssignableUsersHandler,
  listUsersHandler,
  updateProfileHandler,
} from "./user.controller.js";
import { changePasswordSchema, listUsersSchema, updateProfileSchema } from "./user.validation.js";

export const userRoutes = Router();

userRoutes.use(authMiddleware);
userRoutes.get("/", requireRole(ROLES.ADMIN), validate(listUsersSchema), listUsersHandler);
userRoutes.get("/lookup", listAssignableUsersHandler);
userRoutes.patch("/profile", validate(updateProfileSchema), updateProfileHandler);
userRoutes.patch("/profile/password", validate(changePasswordSchema), changePasswordHandler);
