import type { LeadSource, LeadStatus } from "../../generated/prisma/client.js";
import type { Role } from "../../constants/ROLES.js";

export type { LeadSource, LeadStatus };

export interface LeadScope {
  userId: string;
  role: Role;
}

export interface CreateLeadDto {
  companyName?: string;
  contactName: string;
  email?: string;
  phone?: string;
  website?: string;
  source?: LeadSource;
  status?: LeadStatus;
  remarks?: string;
  assignedToId?: string;
}

export interface UpdateLeadDto {
  companyName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  source?: LeadSource;
  status?: LeadStatus;
  remarks?: string;
  assignedToId?: string | null;
}

export interface ListLeadsQuery {
  page: number;
  limit: number;
  search?: string;
  status?: LeadStatus;
  source?: LeadSource;
  assignedToId?: string;
}
