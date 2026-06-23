import { prisma } from "../../database/prisma.js";

export const findUserByEmail = (email: string) => prisma.user.findUnique({ where: { email } });

export const findUserById = (id: string) => prisma.user.findUnique({ where: { id } });

export const createUser = (data: { name: string; email: string; passwordHash: string }) =>
  prisma.user.create({ data });