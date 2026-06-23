import { z } from "zod";
import { ROLES } from "../../constants/ROLES.js";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.email(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6).max(72),
  }),
});

export const listUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).optional(),
    role: z.enum([ROLES.ADMIN, ROLES.MEMBER]).optional(),
  }),
});
