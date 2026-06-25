import type { LeadSource, LeadStatus } from "../../generated/prisma/client.js";
import type { LeadScope } from "../leads/lead.types.js";

export type { LeadScope };

export interface AnalyticsSummary {
  totalLeads: number;
  wonLeads: number;
  lostLeads: number;
  openLeads: number;
  conversionRate: number;
}

export interface StatusBucket {
  status: LeadStatus;
  count: number;
}

export interface SourceBucket {
  source: LeadSource;
  count: number;
}

export interface TrendPoint {
  date: string;
  count: number;
}

export interface AssigneeBucket {
  userId: string | null;
  name: string;
  count: number;
}

export interface TeamSummary {
  totalUsers: number;
  admins: number;
  members: number;
}

export interface AnalyticsOverview {
  summary: AnalyticsSummary;
  byStatus: StatusBucket[];
  bySource: SourceBucket[];
  trend: TrendPoint[];
  byAssignee?: AssigneeBucket[];
  team?: TeamSummary;
}
