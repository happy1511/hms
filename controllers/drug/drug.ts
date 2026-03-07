import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { apiResponse } from "@/lib/apiResponse";
import { paginationValidator } from "@/validators/api/common/pagination";
import { Prisma, User } from "@/generated/prisma/client";
import {
  drugValidator,
  partialDrugValidator,
} from "@/validators/api/masters/drug";

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
      const and: Prisma.DrugWhereInput[] = [];

      if (search) {
        and.push({ name: { contains: search } });
      }
      and.push({ isDeleted: false });

      if (createdAtFrom || createdAtTo) {
        and.push({
          createdAt: {
            ...(createdAtFrom && { gte: createdAtFrom }),
            ...(createdAtTo && { lte: createdAtTo }),
          },
        });
      }

      const where: Prisma.DrugWhereInput = and.length ? { AND: and } : {};

      const [items, total] = await prisma.$transaction([
        prisma.drug.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
        }),
        prisma.drug.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Drug Fetched Successfully",
        data: items,
        total,
      });
    },
  });
};

export const getDetailsAPI = async (
  req: Request,
  { params }: { params: { drugId: string } },
) => {
  return validateRequest({
    paramsSchema: partialDrugValidator,
    req,
    params,
    onSuccess: async ({ params }) => {
      const id = params.drugId;

      const details = await prisma.drug.findFirst({
        where: { id, isDeleted: false },
        include: {
          inventoryItems: { include: { drug: true } },
          purchaseItems: { include: { drug: true } },
        },
      });

      if (!details) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Drug not found",
        });
      }

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Drug Fetched Successfully",
        data: details,
      });
    },
  });
};

export const createAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: drugValidator,
    req,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const data = await tx.drug.create({
          data: {
            ...body,
            createdBy: user.id ,
            updatedBy: user.id ,
          },
        });
        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Drug Created Successfully",
          data: data,
        });
      });
    },
  });
};

export const updateAPI = async (
  req: Request,
  { params }: { params: { drugId: string } },
  user: User,
) => {
  return validateRequest({
    bodySchema: partialDrugValidator,
    paramsSchema: partialDrugValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const body = data;

        const updatedDrug = await tx.drug.update({
          where: { id: data.drugId },
          data: {
            ...body,
            updatedBy: user.id ,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Drug Updated Successfully",
          data: updatedDrug,
        });
      });
    },
  });
};

export const deleteAPI = async (
  req: Request,
  { params }: { params: { drugId: string } },
  user: User,
) => {
  return validateRequest({
    paramsSchema: partialDrugValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      const data = params;
      return prisma.$transaction(async (tx) => {
        const existingDrug = await tx.drug.findFirst({
          where: { id: data.drugId, isDeleted: false },
        });

        if (!existingDrug) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Drug not found",
          });
        }

        await tx.drug.update({
          where: { id: data.drugId },
          data: {
            isDeleted: true,
            deletedBy: user.id ,
            updatedBy: user.id ,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Drug Deleted Successfully",
          data: null,
        });
      });
    },
  });
};

