import { ERROR_MESSAGES } from "../../constants/ERROR_MESSAGES.js";
import { HTTP_STATUS } from "../../constants/HTTP_STATUS.js";
import { ApiError } from "../../utils/ApiError.js";
import { getLeadById } from "../leads/lead.service.js";
import type { LeadScope } from "../leads/lead.types.js";
import {
  createCustomerFromLead as createCustomerFromLeadRecord,
  findCustomerById,
  findCustomerByLeadId,
  findManyCustomers,
  softDeleteCustomer,
  updateCustomer as updateCustomerRecord,
} from "./customer.repository.js";
import type { ConvertLeadDto, CustomerScope, ListCustomersQuery, UpdateCustomerDto } from "./customer.types.js";

export const convertLeadToCustomer = async (
  leadId: string,
  dto: ConvertLeadDto,
  scope: CustomerScope,
) => {
  const lead = await getLeadById(leadId, scope as LeadScope);

  if (lead.status !== "WON") {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, "Only won leads can be converted to customers");
  }

  const existing = await findCustomerByLeadId(leadId);
  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, "This lead has already been converted to a customer");
  }

  return createCustomerFromLeadRecord({
    companyName: lead.companyName,
    contactName: lead.contactName,
    email: lead.email,
    phone: lead.phone,
    assignedToId: lead.assignedToId,
    createdById: scope.userId,
    leadId: lead.id,
    ...dto,
  });
};

export const getCustomerById = async (id: string, scope: CustomerScope) => {
  const customer = await findCustomerById(id, scope);
  if (!customer) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
  }
  return customer;
};

export const updateCustomer = async (id: string, dto: UpdateCustomerDto, scope: CustomerScope) => {
  await getCustomerById(id, scope);
  return updateCustomerRecord(id, dto);
};

export const deleteCustomer = async (id: string, scope: CustomerScope): Promise<void> => {
  await getCustomerById(id, scope);
  await softDeleteCustomer(id);
};

export const listCustomers = async (query: ListCustomersQuery, scope: CustomerScope) => {
  const { items, total } = await findManyCustomers({ ...query, scope });

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
