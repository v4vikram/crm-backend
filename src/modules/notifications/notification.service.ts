import { NotificationType } from "../../generated/prisma/client.js";
import { ROLES } from "../../constants/ROLES.js";
import { logger } from "../../config/logger.js";
import { findUserIdsByRole } from "../users/user.repository.js";
import {
  countUnread,
  createManyNotifications,
  findManyForUser,
  markAllAsRead,
  markAsRead,
} from "./notification.repository.js";
import type { ListNotificationsQuery } from "./notification.types.js";

export const notifyLeadCreated = async (lead: {
  id: string;
  contactName: string;
  companyName: string | null;
}): Promise<void> => {
  try {
    const adminIds = await findUserIdsByRole(ROLES.ADMIN);
    if (adminIds.length === 0) return;

    const message = lead.companyName
      ? `${lead.contactName} (${lead.companyName}) was added as a new lead.`
      : `${lead.contactName} was added as a new lead.`;

    await createManyNotifications(
      adminIds.map((userId) => ({
        userId,
        type: NotificationType.LEAD_CREATED,
        title: "New lead created",
        message,
        entityType: "LEAD",
        entityId: lead.id,
      })),
    );
  } catch (err) {
    logger.error({ err, leadId: lead.id }, "Failed to create lead-created notifications");
  }
};

export const listNotifications = async (userId: string, query: ListNotificationsQuery) => {
  const { items, total } = await findManyForUser({ ...query, userId });

  return {
    items,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
};

export const getUnreadCount = (userId: string) => countUnread(userId);

export const markNotificationAsRead = (id: string, userId: string) => markAsRead(id, userId);

export const markAllNotificationsAsRead = (userId: string) => markAllAsRead(userId);
