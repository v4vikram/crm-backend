import { Router } from "express";
import { ROLES } from "../../constants/ROLES.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/role.middleware.js";
import { getDashboardInsightHandler, getSalesPerformanceHandler } from "./ai.controller.js";

export const aiRoutes = Router();

aiRoutes.use(authMiddleware);
aiRoutes.get("/dashboard-insight", getDashboardInsightHandler);
aiRoutes.get("/sales-performance", requireRole(ROLES.ADMIN), getSalesPerformanceHandler);
