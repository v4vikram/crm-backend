import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../database/prisma.js";

export const countLeads = (where: Prisma.LeadWhereInput) => prisma.lead.count({ where });

export const groupLeadsByStatus = (where: Prisma.LeadWhereInput) =>
  prisma.lead.groupBy({ by: ["status"], where, _count: { _all: true } });

export const groupLeadsBySource = (where: Prisma.LeadWhereInput) =>
  prisma.lead.groupBy({ by: ["source"], where, _count: { _all: true } });

export const groupLeadsByAssignee = (where: Prisma.LeadWhereInput) =>
  prisma.lead.groupBy({ by: ["assignedToId"], where, _count: { _all: true } });

export const findLeadCreationDates = (where: Prisma.LeadWhereInput) =>
  prisma.lead.findMany({ where, select: { createdAt: true } });
