import type { Request, Response } from "express";
import { ERROR_MESSAGES } from "../../constants/ERROR_MESSAGES.js";
import { HTTP_STATUS } from "../../constants/HTTP_STATUS.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  convertLeadToCustomer,
  deleteCustomer,
  getCustomerById,
  listCustomers,
  updateCustomer,
} from "./customer.service.js";
import type { ConvertLeadDto, CustomerScope, ListCustomersQuery, UpdateCustomerDto } from "./customer.types.js";

const requireScope = (req: Request): CustomerScope => {
  if (!req.user) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
  }
  return { userId: req.user.id, role: req.user.role };
};

export const convertLeadHandler = asyncHandler(async (req: Request, res: Response) => {
  const scope = requireScope(req);
  const customer = await convertLeadToCustomer(
    req.params.leadId as string,
    req.body as ConvertLeadDto,
    scope,
  );
  res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, "Lead converted to customer successfully", customer));
});

export const getCustomerHandler = asyncHandler(async (req: Request, res: Response) => {
  const scope = requireScope(req);
  const customer = await getCustomerById(req.params.id as string, scope);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, "Customer fetched successfully", customer));
});

export const updateCustomerHandler = asyncHandler(async (req: Request, res: Response) => {
  const scope = requireScope(req);
  const customer = await updateCustomer(req.params.id as string, req.body as UpdateCustomerDto, scope);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, "Customer updated successfully", customer));
});

export const deleteCustomerHandler = asyncHandler(async (req: Request, res: Response) => {
  const scope = requireScope(req);
  await deleteCustomer(req.params.id as string, scope);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, "Customer deleted successfully"));
});

export const listCustomersHandler = asyncHandler(async (req: Request, res: Response) => {
  const scope = requireScope(req);
  const result = await listCustomers(req.query as unknown as ListCustomersQuery, scope);
  res.status(HTTP_STATUS.OK).json(new ApiResponse(HTTP_STATUS.OK, "Customers fetched successfully", result));
});
