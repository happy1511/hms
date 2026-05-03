import { Prisma, User } from "@/generated/prisma/client";
import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { paginationValidator } from "@/validators/api/common/pagination";
import {
  hsnSacValidator,
  partialHsnSacValidator,
} from "@/validators/api/masters/hsnSac";

export const getAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const search = query.search ?? "";
      const createdAtFrom = query["createdAt[from]"] ?? "";
      const createdAtTo = query["createdAt[to]"] ?? "";
      const skip = (page - 1) * limit;

      const and: Prisma.HsnSacWhereInput[] = [{ isDeleted: false }];

      if (search) {
        const parsedCode = Number(search);
        if (!Number.isNaN(parsedCode)) {
          and.push({
            code: { equals: parsedCode },
          });
        }
      }

      if (createdAtFrom || createdAtTo) {
        and.push({
          createdAt: {
            ...(createdAtFrom && { gte: createdAtFrom }),
            ...(createdAtTo && { lte: createdAtTo }),
          },
        });
      }

      const where: Prisma.HsnSacWhereInput = and.length ? { AND: and } : {};

      const [items, total] = await prisma.$transaction([
        prisma.hsnSac.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
          include: {
            createdByUser: { select: { id: true, name: true } },
            updatedByUser: { select: { id: true, name: true } },
          },
        }),
        prisma.hsnSac.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "HSN/SAC fetched successfully",
        data: items,
        total,
      });
    },
  });
};

export const getDetailsAPI = async (
  req: Request,
  { params }: { params: { hsnSacId: string } },
) => {
  return validateRequest({
    paramsSchema: partialHsnSacValidator,
    req,
    params,
    onSuccess: async ({ params }) => {
      const details = await prisma.hsnSac.findFirst({
        where: { id: params.hsnSacId, isDeleted: false },
        include: {
          createdByUser: { select: { id: true, name: true } },
          updatedByUser: { select: { id: true, name: true } },
        },
      });

      if (!details) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "HSN/SAC not found",
        });
      }

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "HSN/SAC fetched successfully",
        data: details,
      });
    },
  });
};

export const createAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: hsnSacValidator,
    req,
    onSuccess: async ({ body, params }) => {
      return prisma.$transaction(async (tx) => {
        const data = await tx.hsnSac.create({
          data: {
            ...body,
            createdBy: user.id,
            updatedBy: user.id,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "HSN/SAC created successfully",
          data,
        });
      });
    },
  });
};

export const updateAPI = async (
  req: Request,
  { params }: { params: { hsnSacId: string } },
  user: User,
) => {
  return validateRequest({
    bodySchema: partialHsnSacValidator,
    paramsSchema: partialHsnSacValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const hsnSacId = Number(params.hsnSacId);
        const existing = await tx.hsnSac.findFirst({
          where: { id: hsnSacId, isDeleted: false },
        });

        if (!existing) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "HSN/SAC not found",
          });
        }

        const updated = await tx.hsnSac.update({
          where: { id: hsnSacId },
          data: {
            code: body.code,
            cGstPercentage: body.cGstPercentage,
            sGstPercentage: body.sGstPercentage,
            iGstPercentage: body.iGstPercentage,
            updatedBy: user.id,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "HSN/SAC updated successfully",
          data: updated,
        });
      });
    },
  });
};

export const deleteAPI = async (
  req: Request,
  { params }: { params: { hsnSacId: string } },
  user: User,
) => {
  return validateRequest({
    paramsSchema: partialHsnSacValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      return prisma.$transaction(async (tx) => {
        const existing = await tx.hsnSac.findFirst({
          where: { id: params.hsnSacId, isDeleted: false },
        });

        if (!existing) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "HSN/SAC not found",
          });
        }

        await tx.hsnSac.update({
          where: { id: params.hsnSacId },
          data: {
            isDeleted: true,
            deletedBy: user.id,
            updatedBy: user.id,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "HSN/SAC deleted successfully",
          data: null,
        });
      });
    },
  });
};
