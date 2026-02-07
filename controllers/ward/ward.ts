import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { apiResponse } from "@/lib/apiResponse";
import { paginationValidator } from "@/validators/api/common/pagination";
import { Prisma } from "@/generated/prisma/client";
import {
  partialWardValidator,
  wardValidator,
} from "@/validators/api/masters/ward";

export const getAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const search = query.search ?? "";
      const status = query.status ?? "";
      const createdAtFrom = query["createdAt[from]"] ?? "";
      const createdAtTo = query["createdAt[to]"] ?? "";

      const skip = (page - 1) * limit;
      const and: Prisma.WardWhereInput[] = [];

      if (search) {
        and.push({ name: { contains: search } });
      }

      if (status) {
        and.push({ status: { equals: status } });
      }

      if (createdAtFrom || createdAtTo) {
        and.push({
          createdAt: {
            ...(createdAtFrom && { gte: createdAtFrom }),
            ...(createdAtTo && { lte: createdAtTo }),
          },
        });
      }

      const where: Prisma.WardWhereInput = and.length ? { AND: and } : {};

      const [items, total] = await prisma.$transaction([
        prisma.ward.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
          select: {
            id: true,
            floor: true,
            description: true,
            name: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.ward.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Ward Fetched Successfully",
        data: items,
        total,
      });
    },
  });
};

export const getDetailsAPI = async (
  req: Request,
  { params }: { params: { wardId: string } },
) => {
  return validateRequest({
    paramsSchema: partialWardValidator,
    req,
    params,
    onSuccess: async ({ params }) => {
      const id = params.wardId;

      const ward = await prisma.ward.findUnique({
        where: { id },
        select: {
          id: true,
          floor: true,
          description: true,
          name: true,
          status: true,
        },
      });

      if (!ward) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Ward not found",
        });
      }

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Ward Fetched Successfully",
        data: ward,
      });
    },
  });
};
export const createAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: wardValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const existingWard = await tx.ward.findFirst({
          where: { name: data.name },
        });

        if (existingWard) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "ward with this name already exists",
          });
        }

        const { name, floorId, status, description } = data;

        const existingFloor = await tx.floor.findUnique({
          where: {
            id: floorId,
          },
          select: { id: true },
        });

        if (!existingFloor) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Floor Not found",
            data: null,
          });
        }

        const ward = await tx.ward.create({
          data: {
            name,
            description,
            status,
            floorId: existingFloor.id,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Ward Created Successfully",
          data: ward,
        });
      });
    },
  });
};
export const updateAPI = async (
  req: Request,
  { params }: { params: { wardId: string } },
) => {
  return validateRequest({
    bodySchema: partialWardValidator,
    paramsSchema: partialWardValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const existingWard = await tx.ward.findUnique({
          where: { id: data.wardId },
          include: { floor: true },
        });

        if (!existingWard) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Ward not found",
          });
        }

        if (data.name) {
          const duplicate = await tx.ward.count({
            where: {
              name: data.name,
              id: { not: data.wardId },
            },
          });

          if (duplicate > 0) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "Ward with same name already exists",
            });
          }
        }

        const { description, name, floorId, status } = data;

        const existingFloor = await tx.floor.findUnique({
          where: {
            id: floorId,
          },
          select: { id: true },
        });

        if (!existingFloor) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Floor Not found",
            data: null,
          });
        }

        const updatedWard = await tx.ward.update({
          where: { id: data.wardId },
          data: {
            name,
            description,
            floorId,
            status,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Ward Updated Successfully",
          data: updatedWard,
        });
      });
    },
  });
};

export const deleteAPI = async (
  req: Request,
  { params }: { params: { wardId: string } },
) => {
  return validateRequest({
    bodySchema: partialWardValidator,
    paramsSchema: partialWardValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      return prisma.$transaction(async (tx) => {
        const existingWard = await tx.ward.findUnique({
          where: { id: data.wardId },
        });

        if (!existingWard) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Ward not found",
          });
        }

        await prisma.ward.delete({
          where: { id: data.wardId },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Ward Deleted Successfully",
          data: null,
        });
      });
    },
  });
};
