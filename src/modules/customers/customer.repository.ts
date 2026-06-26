import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../database/prisma.js";
import { ROLES } from "../../constants/ROLES.js";
import type { CustomerScope, ListCustomersQuery, UpdateCustomerDto } from "./customer.types.js";

const assigneeInclude = {
  assignedTo: { select: { id: true, name: true, email: true } },
  createdBy: { select: { id: true, name: true, email: true } },
  lead: { select: { id: true, contactName: true, companyName: true } },
} satisfies Prisma.CustomerInclude;

export const scopeFilter = (scope: CustomerScope): Prisma.CustomerWhereInput =>
  scope.role === ROLES.ADMIN
    ? {}
    : { OR: [{ assignedToId: scope.userId }, { createdById: scope.userId }] };

export const findCustomerByLeadId = (leadId: string) =>
  prisma.customer.findUnique({ where: { leadId } });

export const createCustomerFromLead = (
  data: Prisma.CustomerUncheckedCreateInput,
) => prisma.customer.create({ data, include: assigneeInclude });

export const findCustomerById = (id: string, scope: CustomerScope) =>
  prisma.customer.findFirst({
    where: { AND: [{ id, deletedAt: null }, scopeFilter(scope)] },
    include: assigneeInclude,
  });

export const updateCustomer = (id: string, dto: UpdateCustomerDto) =>
  prisma.customer.update({ where: { id }, data: dto, include: assigneeInclude });

export const softDeleteCustomer = (id: string) =>
  prisma.customer.update({ where: { id }, data: { deletedAt: new Date() } });

export const findManyCustomers = async ({
  page,
  limit,
  search,
  status,
  assignedToId,
  scope,
}: ListCustomersQuery & { scope: CustomerScope }) => {
  const where: Prisma.CustomerWhereInput = {
    AND: [
      { deletedAt: null },
      scopeFilter(scope),
      status ? { status } : {},
      assignedToId ? { assignedToId } : {},
      search
        ? {
            OR: [
              { contactName: { contains: search, mode: "insensitive" } },
              { companyName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
    ],
  };

  const [items, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: assigneeInclude,
    }),
    prisma.customer.count({ where }),
  ]);

  return { items, total };
};
