import bcrypt from "bcrypt";
import { APP_CONSTANTS } from "../../constants/APP_CONSTANTS.js";
import { ERROR_MESSAGES } from "../../constants/ERROR_MESSAGES.js";
import { HTTP_STATUS } from "../../constants/HTTP_STATUS.js";
import type { PaginatedResult } from "../../types/api.js";
import { ApiError } from "../../utils/ApiError.js";
import { findUserByEmail, findUserById } from "../auth/auth.repository.js";
import { toSafeUser } from "../auth/auth.service.js";
import type { SafeUser } from "../auth/auth.types.js";
import {
  createUser as createUserRecord,
  deleteUserById,
  findAssignableUsers,
  findManyUsers,
  updateUserById,
  updateUserPassword,
  updateUserProfile,
} from "./user.repository.js";
import type {
  ChangePasswordDto,
  CreateUserDto,
  ListUsersQuery,
  UpdateProfileDto,
  UpdateUserDto,
} from "./user.types.js";

export const createUser = async (dto: CreateUserDto): Promise<SafeUser> => {
  const existing = await findUserByEmail(dto.email);
  if (existing) {
    throw new ApiError(HTTP_STATUS.CONFLICT, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(dto.password, APP_CONSTANTS.BCRYPT_SALT_ROUNDS);
  const user = await createUserRecord({
    name: dto.name,
    email: dto.email,
    passwordHash,
    role: dto.role,
  });

  return toSafeUser(user);
};

export const updateProfile = async (userId: string, dto: UpdateProfileDto): Promise<SafeUser> => {
  const existing = await findUserByEmail(dto.email);
  if (existing && existing.id !== userId) {
    throw new ApiError(HTTP_STATUS.CONFLICT, "Email is already registered");
  }

  const user = await updateUserProfile(userId, dto);
  return toSafeUser(user);
};

export const changePassword = async (userId: string, dto: ChangePasswordDto): Promise<void> => {
  const user = await findUserById(userId);
  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
  }

  const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
  if (!isValid) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, "Current password is incorrect");
  }

  const passwordHash = await bcrypt.hash(dto.newPassword, APP_CONSTANTS.BCRYPT_SALT_ROUNDS);
  await updateUserPassword(userId, passwordHash);
};

export const getUserById = async (id: string): Promise<SafeUser> => {
  const user = await findUserById(id);
  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
  }
  return toSafeUser(user);
};

export const updateUser = async (id: string, dto: UpdateUserDto): Promise<SafeUser> => {
  const existing = await findUserById(id);
  if (!existing) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
  }

  if (dto.email) {
    const emailOwner = await findUserByEmail(dto.email);
    if (emailOwner && emailOwner.id !== id) {
      throw new ApiError(HTTP_STATUS.CONFLICT, "Email is already registered");
    }
  }

  const user = await updateUserById(id, dto);
  return toSafeUser(user);
};

export const deleteUser = async (id: string): Promise<void> => {
  const existing = await findUserById(id);
  if (!existing) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
  }
  await deleteUserById(id);
};

export const listAssignableUsers = () => findAssignableUsers();

export const listUsers = async (query: ListUsersQuery): Promise<PaginatedResult<SafeUser>> => {
  const { items, total } = await findManyUsers(query);

  return {
    items: items.map(toSafeUser),
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  };
};
