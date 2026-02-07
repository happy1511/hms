import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { apiResponse } from "@/lib/apiResponse";
import { paginationValidator } from "@/validators/api/common/pagination";
import { Prisma } from "@/generated/prisma/client";
import {
  floorValidator,
  partialFloorValidator,
} from "@/validators/api/masters/floor";

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
      const and: Prisma.FloorWhereInput[] = [];

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

      const where: Prisma.FloorWhereInput = and.length ? { AND: and } : {};

      const [items, total] = await prisma.$transaction([
        prisma.floor.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
          select: {
            id: true,
            departments: true,
            description: true,
            name: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.floor.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Floor Fetched Successfully",
        data: items,
        total,
      });
    },
  });
};

export const getDetailsAPI = async (
  req: Request,
  { params }: { params: { floorId: string } },
) => {
  return validateRequest({
    paramsSchema: partialFloorValidator,
    req,
    params,
    onSuccess: async ({ params }) => {
      const id = params.floorId;

      const floor = await prisma.floor.findUnique({
        where: { id },
        select: {
          id: true,
          departments: true,
          description: true,
          name: true,
          status: true,
        },
      });

      if (!floor) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Floor not found",
        });
      }

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Floor Fetched Successfully",
        data: floor,
      });
    },
  });
};

export const createAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: floorValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const existingFloor = await tx.floor.findFirst({
          where: { name: data.name },
        });

        if (existingFloor) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "floor with this name already exists",
          });
        }

        const { name, status, description } = data;

        const floor = await tx.floor.create({
          data: {
            name,
            description,
            status,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Floor Created Successfully",
          data: floor,
        });
      });
    },
  });
};
export const updateAPI = async (
  req: Request,
  { params }: { params: { floorId: string } },
) => {
  return validateRequest({
    bodySchema: partialFloorValidator,
    paramsSchema: partialFloorValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const existingFloor = await tx.floor.findUnique({
          where: { id: data.floorId },
          include: { departments: true },
        });

        if (!existingFloor) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Floor not found",
          });
        }

        if (data.name) {
          const duplicate = await tx.floor.count({
            where: {
              name: data.name,
              id: { not: data.floorId },
            },
          });

          if (duplicate > 0) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "Floor with same name already exists",
            });
          }
        }

        const { description, status, name } = data;

        const updatedFloor = await tx.floor.update({
          where: { id: data.floorId },
          data: {
            name,
            description,
            status,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Floor Updated Successfully",
          data: updatedFloor,
        });
      });
    },
  });
};

export const deleteAPI = async (
  req: Request,
  { params }: { params: { floorId: string } },
) => {
  return validateRequest({
    bodySchema: partialFloorValidator,
    paramsSchema: partialFloorValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      return prisma.$transaction(async (tx) => {
        const existingFloor = await tx.floor.findUnique({
          where: { id: data.floorId },
        });

        if (!existingFloor) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Floor not found",
          });
        }

        await prisma.floor.delete({
          where: { id: data.floorId },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Floor Deleted Successfully",
          data: null,
        });
      });
    },
  });
};
