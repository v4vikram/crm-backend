import type { Role } from "../../constants/ROLES.js";

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface UpdateProfileDto {
  name: string;
  email: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: Role;
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
