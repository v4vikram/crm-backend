import { prisma } from "../../database/prisma.js";
import { LeadStatus } from "../../generated/prisma/client.js";
import { ROLES } from "../../constants/ROLES.js";
import { findUsersBasicByRole } from "../users/user.repository.js";
import type { EmployeePerformance } from "./ai.types.js";

export const getEmployeePerformance = async (): Promise<EmployeePerformance[]> => {
  const [members, totalGroups, wonGroups, lostGroups, dealValueGroups] = await Promise.all([
    findUsersBasicByRole(ROLES.MEMBER),
    prisma.lead.groupBy({
      by: ["assignedToId"],
      where: { deletedAt: null, assignedToId: { not: null } },
      _count: { _all: true },
    }),
    prisma.lead.groupBy({
      by: ["assignedToId"],
      where: { deletedAt: null, status: LeadStatus.WON, assignedToId: { not: null } },
      _count: { _all: true },
    }),
    prisma.lead.groupBy({
      by: ["assignedToId"],
      where: { deletedAt: null, status: LeadStatus.LOST, assignedToId: { not: null } },
      _count: { _all: true },
    }),
    prisma.customer.groupBy({
      by: ["assignedToId"],
      where: { deletedAt: null, assignedToId: { not: null } },
      _sum: { dealValue: true },
    }),
  ]);

  return members.map((member) => {
    const totalLeads = totalGroups.find((group) => group.assignedToId === member.id)?._count._all ?? 0;
    const wonLeads = wonGroups.find((group) => group.assignedToId === member.id)?._count._all ?? 0;
    const lostLeads = lostGroups.find((group) => group.assignedToId === member.id)?._count._all ?? 0;
    const totalDealValue =
      dealValueGroups.find((group) => group.assignedToId === member.id)?._sum.dealValue ?? 0;

    return {
      userId: member.id,
      name: member.name,
      totalLeads,
      wonLeads,
      lostLeads,
      conversionRate: totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 1000) / 10 : 0,
      totalDealValue,
    };
  });
};
