import { prisma } from "../../database/prisma.js";

export const updateUserProfile = (id: string, data: { name: string; email: string }) =>
  prisma.user.update({ where: { id }, data });

export const updateUserPassword = (id: string, passwordHash: string) =>
  prisma.user.update({ where: { id }, data: { passwordHash } });
