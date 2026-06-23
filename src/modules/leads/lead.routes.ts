import { Router } from "express";
import { ROLES } from "../../constants/ROLES.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createLeadHandler,
  deleteLeadHandler,
  getLeadHandler,
  listLeadsHandler,
  updateLeadHandler,
} from "./lead.controller.js";
import {
  createLeadSchema,
  leadIdParamSchema,
  listLeadsSchema,
  updateLeadSchema,
} from "./lead.validation.js";

export const leadRoutes = Router();

leadRoutes.use(authMiddleware);

leadRoutes.get("/", validate(listLeadsSchema), listLeadsHandler);
leadRoutes.post("/", requireRole(ROLES.ADMIN), validate(createLeadSchema), createLeadHandler);
leadRoutes.get("/:id", validate(leadIdParamSchema), getLeadHandler);
leadRoutes.patch("/:id", validate(updateLeadSchema), updateLeadHandler);
leadRoutes.delete("/:id", requireRole(ROLES.ADMIN), validate(leadIdParamSchema), deleteLeadHandler);
