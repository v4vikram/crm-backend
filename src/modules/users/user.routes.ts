import { Router } from "express";
import { ROLES } from "../../constants/ROLES.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  changePasswordHandler,
  createUserHandler,
  deleteUserHandler,
  getUserHandler,
  listAssignableUsersHandler,
  listUsersHandler,
  updateProfileHandler,
  updateUserHandler,
} from "./user.controller.js";
import {
  changePasswordSchema,
  createUserSchema,
  listUsersSchema,
  updateProfileSchema,
  updateUserSchema,
  userIdParamSchema,
} from "./user.validation.js";

export const userRoutes = Router();

userRoutes.use(authMiddleware);
userRoutes.get("/", requireRole(ROLES.ADMIN), validate(listUsersSchema), listUsersHandler);
userRoutes.post("/", requireRole(ROLES.ADMIN), validate(createUserSchema), createUserHandler);
userRoutes.get("/lookup", listAssignableUsersHandler);
userRoutes.patch("/profile", validate(updateProfileSchema), updateProfileHandler);
userRoutes.patch("/profile/password", validate(changePasswordSchema), changePasswordHandler);
userRoutes.get("/:id", requireRole(ROLES.ADMIN), validate(userIdParamSchema), getUserHandler);
userRoutes.patch("/:id", requireRole(ROLES.ADMIN), validate(updateUserSchema), updateUserHandler);
userRoutes.delete("/:id", requireRole(ROLES.ADMIN), validate(userIdParamSchema), deleteUserHandler);
