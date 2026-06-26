import { prisma } from "../../database/prisma.js";
import type { CreateNotificationDto, ListNotificationsQuery } from "./notification.types.js";

export const createManyNotifications = (notifications: CreateNotificationDto[]) =>
  prisma.notification.createMany({ data: notifications });

export const findManyForUser = async ({
  userId,
  page,
  limit,
  unreadOnly,
}: ListNotificationsQuery & { userId: string }) => {
  const where = { userId, ...(unreadOnly ? { isRead: false } : {}) };

  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.count({ where }),
  ]);

  return { items, total };
};

export const countUnread = (userId: string) =>
  prisma.notification.count({ where: { userId, isRead: false } });

export const markAsRead = (id: string, userId: string) =>
  prisma.notification.updateMany({
    where: { id, userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });

export const markAllAsRead = (userId: string) =>
  prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
