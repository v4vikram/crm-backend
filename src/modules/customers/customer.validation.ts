import { z } from "zod";

const customerStatusEnum = z.enum(["ACTIVE", "INACTIVE", "CHURNED"]);

export const convertLeadSchema = z.object({
  params: z.object({ leadId: z.uuid() }),
  body: z.object({
    address: z.string().trim().max(500).optional(),
    dealValue: z.coerce.number().min(0).optional(),
    status: customerStatusEnum.optional(),
    remarks: z.string().trim().max(2000).optional(),
  }),
});

export const updateCustomerSchema = z.object({
  params: z.object({ id: z.uuid() }),
  body: z.object({
    companyName: z.string().trim().min(1).max(255).optional(),
    contactName: z.string().trim().min(2).max(255).optional(),
    email: z.email().optional(),
    phone: z.string().trim().min(1).max(20).optional(),
    address: z.string().trim().max(500).optional(),
    dealValue: z.coerce.number().min(0).nullable().optional(),
    status: customerStatusEnum.optional(),
    remarks: z.string().trim().max(2000).optional(),
    assignedToId: z.uuid().nullable().optional(),
  }),
});

export const customerIdParamSchema = z.object({
  params: z.object({ id: z.uuid() }),
});

export const listCustomersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().trim().min(1).optional(),
    status: customerStatusEnum.optional(),
    assignedToId: z.uuid().optional(),
  }),
});
