import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../database/prisma.js";
import type { Role } from "../../constants/ROLES.js";
import type { ListUsersQuery } from "./user.types.js";

export const createUser = (data: { name: string; email: string; passwordHash: string; role: Role }) =>
  prisma.user.create({ data });

export const updateUserProfile = (id: string, data: { name: string; email: string }) =>
  prisma.user.update({ where: { id }, data });

export const updateUserPassword = (id: string, passwordHash: string) =>
  prisma.user.update({ where: { id }, data: { passwordHash } });

export const updateUserById = (
  id: string,
  data: { name?: string; email?: string; role?: Role },
) => prisma.user.update({ where: { id }, data });

export const deleteUserById = (id: string) => prisma.user.delete({ where: { id } });

export const countUsersByRole = () => prisma.user.groupBy({ by: ["role"], _count: { _all: true } });

export const findAssignableUsers = () =>
  prisma.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

export const findManyUsers = async ({ page, limit, search, role }: ListUsersQuery) => {
  const where: Prisma.UserWhereInput = {
    ...(role ? { role } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total };
};
