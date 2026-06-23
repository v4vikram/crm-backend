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
  findAssignableUsers,
  findManyUsers,
  updateUserPassword,
  updateUserProfile,
} from "./user.repository.js";
import type { ChangePasswordDto, ListUsersQuery, UpdateProfileDto } from "./user.types.js";

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
