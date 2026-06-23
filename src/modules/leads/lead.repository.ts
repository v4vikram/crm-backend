import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../database/prisma.js";
import { ROLES } from "../../constants/ROLES.js";
import type { CreateLeadDto, LeadScope, ListLeadsQuery, UpdateLeadDto } from "./lead.types.js";

const assigneeInclude = {
  assignedTo: { select: { id: true, name: true, email: true } },
  createdBy: { select: { id: true, name: true, email: true } },
} satisfies Prisma.LeadInclude;

const scopeFilter = (scope: LeadScope): Prisma.LeadWhereInput =>
  scope.role === ROLES.ADMIN
    ? {}
    : { OR: [{ assignedToId: scope.userId }, { createdById: scope.userId }] };

export const createLead = (createdById: string, dto: CreateLeadDto) =>
  prisma.lead.create({ data: { ...dto, createdById }, include: assigneeInclude });

export const findLeadById = (id: string, scope: LeadScope) =>
  prisma.lead.findFirst({
    where: { AND: [{ id, deletedAt: null }, scopeFilter(scope)] },
    include: assigneeInclude,
  });

export const updateLead = (id: string, dto: UpdateLeadDto) =>
  prisma.lead.update({ where: { id }, data: dto, include: assigneeInclude });

export const softDeleteLead = (id: string) =>
  prisma.lead.update({ where: { id }, data: { deletedAt: new Date() } });

export const findManyLeads = async ({
  page,
  limit,
  search,
  status,
  source,
  assignedToId,
  scope,
}: ListLeadsQuery & { scope: LeadScope }) => {
  const where: Prisma.LeadWhereInput = {
    AND: [
      { deletedAt: null },
      scopeFilter(scope),
      status ? { status } : {},
      source ? { source } : {},
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
    prisma.lead.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: assigneeInclude,
    }),
    prisma.lead.count({ where }),
  ]);

  return { items, total };
};
