import { Router } from "express";
import { ROLES } from "../../constants/ROLES.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  convertLeadHandler,
  deleteCustomerHandler,
  getCustomerHandler,
  listCustomersHandler,
  updateCustomerHandler,
} from "./customer.controller.js";
import {
  convertLeadSchema,
  customerIdParamSchema,
  listCustomersSchema,
  updateCustomerSchema,
} from "./customer.validation.js";

export const customerRoutes = Router();

customerRoutes.use(authMiddleware);

customerRoutes.get("/", validate(listCustomersSchema), listCustomersHandler);
customerRoutes.post("/from-lead/:leadId", validate(convertLeadSchema), convertLeadHandler);
customerRoutes.get("/:id", validate(customerIdParamSchema), getCustomerHandler);
customerRoutes.patch("/:id", validate(updateCustomerSchema), updateCustomerHandler);
customerRoutes.delete(
  "/:id",
  requireRole(ROLES.ADMIN),
  validate(customerIdParamSchema),
  deleteCustomerHandler,
);
