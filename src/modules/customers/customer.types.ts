import type { CustomerStatus } from "../../generated/prisma/client.js";
import type { Role } from "../../constants/ROLES.js";

export type { CustomerStatus };

export interface CustomerScope {
  userId: string;
  role: Role;
}

export interface ConvertLeadDto {
  address?: string;
  dealValue?: number;
  status?: CustomerStatus;
  remarks?: string;
}

export interface UpdateCustomerDto {
  companyName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  dealValue?: number | null;
  status?: CustomerStatus;
  remarks?: string;
  assignedToId?: string | null;
}

export interface ListCustomersQuery {
  page: number;
  limit: number;
  search?: string;
  status?: CustomerStatus;
  assignedToId?: string;
}
