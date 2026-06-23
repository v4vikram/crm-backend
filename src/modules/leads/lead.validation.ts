import { z } from "zod";

const leadSourceEnum = z.enum([
  "WEBSITE",
  "FACEBOOK",
  "GOOGLE_ADS",
  "REFERRAL",
  "PHONE_CALL",
  "WALK_IN",
  "OTHER",
]);

const leadStatusEnum = z.enum([
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
]);

export const createLeadSchema = z.object({
  body: z.object({
    companyName: z.string().trim().min(1).max(255).optional(),
    contactName: z.string().trim().min(2).max(255),
    email: z.email().optional(),
    phone: z.string().trim().min(1).max(20).optional(),
    website: z.url().optional(),
    source: leadSourceEnum.optional(),
    status: leadStatusEnum.optional(),
    remarks: z.string().trim().max(2000).optional(),
    assignedToId: z.uuid().optional(),
  }),
});

export const updateLeadSchema = z.object({
  params: z.object({ id: z.uuid() }),
  body: z.object({
    companyName: z.string().trim().min(1).max(255).optional(),
    contactName: z.string().trim().min(2).max(255).optional(),
    email: z.email().optional(),
    phone: z.string().trim().min(1).max(20).optional(),
    website: z.url().optional(),
    source: leadSourceEnum.optional(),
    status: leadStatusEnum.optional(),
    remarks: z.string().trim().max(2000).optional(),
    assignedToId: z.uuid().nullable().optional(),
  }),
});

export const leadIdParamSchema = z.object({
  params: z.object({ id: z.uuid() }),
});

export const listLeadsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).optional(),
    status: leadStatusEnum.optional(),
    source: leadSourceEnum.optional(),
    assignedToId: z.uuid().optional(),
  }),
});
