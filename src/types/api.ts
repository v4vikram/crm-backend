import type { Role } from "../constants/ROLES.js";

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginatedMeta;
}

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}