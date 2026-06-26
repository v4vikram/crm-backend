import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  listNotificationsHandler,
  markAllReadHandler,
  markReadHandler,
  unreadCountHandler,
} from "./notification.controller.js";
import { listNotificationsSchema, notificationIdParamSchema } from "./notification.validation.js";

export const notificationRoutes = Router();

notificationRoutes.use(authMiddleware);
notificationRoutes.get("/", validate(listNotificationsSchema), listNotificationsHandler);
notificationRoutes.get("/unread-count", unreadCountHandler);
notificationRoutes.patch("/read-all", markAllReadHandler);
notificationRoutes.patch("/:id/read", validate(notificationIdParamSchema), markReadHandler);
