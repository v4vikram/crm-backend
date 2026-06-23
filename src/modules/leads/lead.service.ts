import { ERROR_MESSAGES } from "../../constants/ERROR_MESSAGES.js";
import { HTTP_STATUS } from "../../constants/HTTP_STATUS.js";
import { ApiError } from "../../utils/ApiError.js";
import {
  createLead as createLeadRecord,
  findLeadById,
  findManyLeads,
  softDeleteLead,
  updateLead as updateLeadRecord,
} from "./lead.repository.js";
import type { CreateLeadDto, LeadScope, ListLeadsQuery, UpdateLeadDto } from "./lead.types.js";

export const createLead = (createdById: string, dto: CreateLeadDto) =>
  createLeadRecord(createdById, dto);

export const getLeadById = async (id: string, scope: LeadScope) => {
  const lead = await findLeadById(id, scope);
  if (!lead) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
  }
  return lead;
};

export const updateLead = async (id: string, dto: UpdateLeadDto, scope: LeadScope) => {
  await getLeadById(id, scope);
  return updateLeadRecord(id, dto);
};

export const deleteLead = async (id: string, scope: LeadScope): Promise<void> => {
  await getLeadById(id, scope);
  await softDeleteLead(id);
};

export const listLeads = async (query: ListLeadsQuery, scope: LeadScope) => {
  const { items, total } = await findManyLeads({ ...query, scope });

  return {
    items,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
};
