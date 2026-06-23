import type { Request, Response } from "express";
import { ERROR_MESSAGES } from "../../constants/ERROR_MESSAGES.js";
import { HTTP_STATUS } from "../../constants/HTTP_STATUS.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createLead, deleteLead, getLeadById, listLeads, updateLead } from "./lead.service.js";
import type { CreateLeadDto, LeadScope, ListLeadsQuery, UpdateLeadDto } from "./lead.types.js";

const requireScope = (req: Request): LeadScope => {
  if (!req.user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
  }
  return { userId: req.user.id, role: req.user.role };
};

export const createLeadHandler = asyncHandler(async (req: Request, res: Response) => {
  const scope = requireScope(req);
  const lead = await createLead(scope.userId, req.body as CreateLeadDto);
  res.status(HTTP_STATUS.CREATED).json(new ApiResponse(HTTP_STATUS.CREATED, "Lead created successfully", lead));
});

export const getLeadHandler = asyncHandler(async (req: Request, res: Response) => {
  const scope = requireScope(req);
  const lead = await getLeadById(req.params.id as string, scope);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, "Lead fetched successfully", lead));
});

export const updateLeadHandler = asyncHandler(async (req: Request, res: Response) => {
  const scope = requireScope(req);
  const lead = await updateLead(req.params.id as string, req.body as UpdateLeadDto, scope);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, "Lead updated successfully", lead));
});

export const deleteLeadHandler = asyncHandler(async (req: Request, res: Response) => {
  const scope = requireScope(req);
  await deleteLead(req.params.id as string, scope);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, "Lead deleted successfully"));
});

export const listLeadsHandler = asyncHandler(async (req: Request, res: Response) => {
  const scope = requireScope(req);
  const result = await listLeads(req.query as unknown as ListLeadsQuery, scope);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, "Leads fetched successfully", result));
});
