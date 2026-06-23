import { prisma } from "../../database/prisma.js";

export const findUserByEmail = (email: string) => prisma.user.findUnique({ where: { email } });

export const findUserById = (id: string) => prisma.user.findUnique({ where: { id } });

export const createUser = (data: { name: string; email: string; passwordHash: string }) =>
  prisma.user.create({ data });

export const updateUserPassword = (id: string, passwordHash: string) =>
  prisma.user.update({ where: { id }, data: { passwordHash } });

export const setPasswordResetToken = (id: string, token: string, expiresAt: Date) =>
  prisma.user.update({
    where: { id },
    data: { passwordResetToken: token, passwordResetExpires: expiresAt },
  });

export const findUserByResetToken = (token: string) =>
  prisma.user.findUnique({ where: { passwordResetToken: token } });

export const clearPasswordResetToken = (id: string) =>
  prisma.user.update({
    where: { id },
    data: { passwordResetToken: null, passwordResetExpires: null },
  });