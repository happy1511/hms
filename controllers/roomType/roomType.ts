import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { apiResponse } from "@/lib/apiResponse";
import { paginationValidator } from "@/validators/api/common/pagination";
import { Prisma } from "@/generated/prisma/client";
import {
  partialRoomTypeValidator,
  roomTypeValidator,
} from "@/validators/api/masters/roomType";

export const getAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const search = query.search ?? "";
      const status = query.status ?? "";
      const departmentId = query.departmentId ?? "";
      const createdAtFrom = query["createdAt[from]"] ?? "";
      const createdAtTo = query["createdAt[to]"] ?? "";

      const skip = (page - 1) * limit;
      const and: Prisma.RoomTypeWhereInput[] = [];

      if (search) {
        and.push({ name: { contains: search } });
      }

      if (status) {
        and.push({ status: { equals: status } });
      }

      if (departmentId) {
        and.push({ departmentId: { equals: departmentId } });
      }

      if (createdAtFrom || createdAtTo) {
        and.push({
          createdAt: {
            ...(createdAtFrom && { gte: createdAtFrom }),
            ...(createdAtTo && { lte: createdAtTo }),
          },
        });
      }

      const where: Prisma.RoomTypeWhereInput = and.length ? { AND: and } : {};

      const [items, total] = await prisma.$transaction([
        prisma.roomType.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
          select: {
            id: true,
            department: true,
            description: true,
            name: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.roomType.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Room Type Fetched Successfully",
        data: items,
        total,
      });
    },
  });
};

export const getDetailsAPI = async (
  req: Request,
  { params }: { params: { typeId: string } },
) => {
  return validateRequest({
    paramsSchema: partialRoomTypeValidator,
    req,
    params,
    onSuccess: async ({ params }) => {
      const id = params.typeId;

      const ward = await prisma.roomType.findUnique({
        where: { id },
        select: {
          id: true,
          department: true,
          description: true,
          name: true,
          status: true,
        },
      });

      if (!ward) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Room Type not found",
        });
      }

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Room Type Fetched Successfully",
        data: ward,
      });
    },
  });
};

export const createAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: roomTypeValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const { name, department, status, description } = data;

        const existingDepartment = await tx.department.findUnique({
          where: {
            id: department?.id,
          },
          select: { id: true },
        });

        if (!existingDepartment) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Department Not found",
            data: null,
          });
        }

        const ward = await tx.roomType.create({
          data: {
            name,
            description,
            status,
            departmentId: existingDepartment.id,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Room Type Created Successfully",
          data: ward,
        });
      });
    },
  });
};
export const updateAPI = async (
  req: Request,
  { params }: { params: { typeId: string } },
) => {
  return validateRequest({
    bodySchema: partialRoomTypeValidator,
    paramsSchema: partialRoomTypeValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const { description, name, department, status } = data;
        const existingRoomType = await tx.roomType.findUnique({
          where: { id: data.typeId },
          include: { department: true },
        });

        if (!existingRoomType) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Room Type not found",
          });
        }

        if (data.name) {
          const duplicate = await tx.roomType.count({
            where: {
              name: data.name,
              id: { not: data.typeId },
            },
          });

          if (duplicate > 0) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "Room Type with same name already exists",
            });
          }
        }

        const existingDepartment = await tx.department.findUnique({
          where: {
            id: department?.id,
          },
          select: { id: true },
        });

        if (!existingDepartment) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Department Not found",
            data: null,
          });
        }

        const updatedWard = await tx.roomType.update({
          where: { id: data.typeId },
          data: {
            name,
            description,
            departmentId: department?.id,
            status,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Room Type Updated Successfully",
          data: updatedWard,
        });
      });
    },
  });
};

export const deleteAPI = async (
  req: Request,
  { params }: { params: { typeId: string } },
) => {
  return validateRequest({
    paramsSchema: partialRoomTypeValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      const data = params;
      return prisma.$transaction(async (tx) => {
        const existingRoomType = await tx.roomType.findUnique({
          where: { id: data.typeId },
        });

        if (!existingRoomType) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Room Type not found",
          });
        }

        await prisma.roomType.delete({
          where: { id: data.typeId },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Room Type Deleted Successfully",
          data: null,
        });
      });
    },
  });
};
