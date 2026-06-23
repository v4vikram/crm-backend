import type { Role } from "../../constants/ROLES.js";

export interface UpdateProfileDto {
  name: string;
  email: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface ListUsersQuery {
  page: number;
  limit: number;
  search?: string;
  role?: Role;
}
