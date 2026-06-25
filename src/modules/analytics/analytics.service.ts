import { LeadSource, LeadStatus } from "../../generated/prisma/client.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { ROLES } from "../../constants/ROLES.js";
import { scopeFilter } from "../leads/lead.repository.js";
import { countUsersByRole, findAssignableUsers } from "../users/user.repository.js";
import {
  countLeads,
  findLeadCreationDates,
  groupLeadsByAssignee,
  groupLeadsBySource,
  groupLeadsByStatus,
} from "./analytics.repository.js";
import type {
  AnalyticsOverview,
  AssigneeBucket,
  LeadScope,
  SourceBucket,
  StatusBucket,
  TrendPoint,
} from "./analytics.types.js";

const TREND_DAYS = 30;

const toDateKey = (date: Date): string => date.toISOString().slice(0, 10);

const buildTrend = (dates: { createdAt: Date }[]): TrendPoint[] => {
  const counts = new Map<string, number>();
  for (const { createdAt } of dates) {
    const key = toDateKey(createdAt);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const points: TrendPoint[] = [];
  for (let i = TREND_DAYS - 1; i >= 0; i -= 1) {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - i);
    const key = toDateKey(date);
    points.push({ date: key, count: counts.get(key) ?? 0 });
  }
  return points;
};

export const getLeadsOverview = async (scope: LeadScope): Promise<AnalyticsOverview> => {
  const trendCutoff = new Date();
  trendCutoff.setUTCDate(trendCutoff.getUTCDate() - (TREND_DAYS - 1));
  trendCutoff.setUTCHours(0, 0, 0, 0);

  const where: Prisma.LeadWhereInput = { AND: [{ deletedAt: null }, scopeFilter(scope)] };
  const trendWhere: Prisma.LeadWhereInput = {
    AND: [{ deletedAt: null }, { createdAt: { gte: trendCutoff } }, scopeFilter(scope)],
  };

  const [total, won, lost, statusGroups, sourceGroups, creationDates] = await Promise.all([
    countLeads(where),
    countLeads({ AND: [where, { status: LeadStatus.WON }] }),
    countLeads({ AND: [where, { status: LeadStatus.LOST }] }),
    groupLeadsByStatus(where),
    groupLeadsBySource(where),
    findLeadCreationDates(trendWhere),
  ]);

  const byStatus: StatusBucket[] = Object.values(LeadStatus).map((status) => ({
    status,
    count: statusGroups.find((group) => group.status === status)?._count._all ?? 0,
  }));

  const bySource: SourceBucket[] = Object.values(LeadSource).map((source) => ({
    source,
    count: sourceGroups.find((group) => group.source === source)?._count._all ?? 0,
  }));

  const overview: AnalyticsOverview = {
    summary: {
      totalLeads: total,
      wonLeads: won,
      lostLeads: lost,
      openLeads: total - won - lost,
      conversionRate: total > 0 ? Math.round((won / total) * 1000) / 10 : 0,
    },
    byStatus,
    bySource,
    trend: buildTrend(creationDates),
  };

  if (scope.role === ROLES.ADMIN) {
    const [assigneeGroups, assignableUsers, roleGroups] = await Promise.all([
      groupLeadsByAssignee(where),
      findAssignableUsers(),
      countUsersByRole(),
    ]);

    const userNameById = new Map(assignableUsers.map((user) => [user.id, user.name]));

    const byAssignee: AssigneeBucket[] = assigneeGroups
      .map((group) => ({
        userId: group.assignedToId,
        name: group.assignedToId ? userNameById.get(group.assignedToId) ?? "Unknown" : "Unassigned",
        count: group._count._all,
      }))
      .sort((a, b) => b.count - a.count);

    overview.byAssignee = byAssignee;
    overview.team = {
      totalUsers: roleGroups.reduce((sum, group) => sum + group._count._all, 0),
      admins: roleGroups.find((group) => group.role === ROLES.ADMIN)?._count._all ?? 0,
      members: roleGroups.find((group) => group.role === ROLES.MEMBER)?._count._all ?? 0,
    };
  }

  return overview;
};
