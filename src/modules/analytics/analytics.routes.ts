import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { getOverviewHandler } from "./analytics.controller.js";

export const analyticsRoutes = Router();

analyticsRoutes.use(authMiddleware);
analyticsRoutes.get("/overview", getOverviewHandler);
