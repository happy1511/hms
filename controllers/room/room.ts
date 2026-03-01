import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { apiResponse } from "@/lib/apiResponse";
import { paginationValidator } from "@/validators/api/common/pagination";
import { Prisma } from "@/generated/prisma/client";
import {
  partialRoomValidator,
  roomValidator,
} from "@/validators/api/masters/room";

export const getAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const search = query.search ?? "";
      const status = query.status ?? "";
      const roomTypeId = query.roomTypeId ?? "";
      const createdAtFrom = query["createdAt[from]"] ?? "";
      const createdAtTo = query["createdAt[to]"] ?? "";

      const skip = (page - 1) * limit;
      const and: Prisma.RoomWhereInput[] = [];

      if (search) {
        and.push({ name: { contains: search } });
      }

      if (status) {
        and.push({ status: { equals: status } });
      }

      if (roomTypeId) {
        and.push({ roomTypeId: { equals: roomTypeId } });
      }

      if (createdAtFrom || createdAtTo) {
        and.push({
          createdAt: {
            ...(createdAtFrom && { gte: createdAtFrom }),
            ...(createdAtTo && { lte: createdAtTo }),
          },
        });
      }

      const where: Prisma.RoomWhereInput = and.length ? { AND: and } : {};

      const [items, total] = await prisma.$transaction([
        prisma.room.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
          select: {
            id: true,
            roomType: true,
            description: true,
            name: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.room.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "room Fetched Successfully",
        data: items,
        total,
      });
    },
  });
};

export const getDetailsAPI = async (
  req: Request,
  { params }: { params: { roomId: string } },
) => {
  return validateRequest({
    paramsSchema: partialRoomValidator,
    req,
    params,
    onSuccess: async ({ params }) => {
      const id = params.roomId;

      const room = await prisma.room.findUnique({
        where: { id },
        select: {
          id: true,
          roomType: true,
          description: true,
          name: true,
          status: true,
        },
      });

      if (!room) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Room not found",
        });
      }

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Room Fetched Successfully",
        data: room,
      });
    },
  });
};
export const createAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: roomValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const { name, roomType, status, description } = data;
        const existingWard = await tx.room.findFirst({
          where: { name: data.name },
        });

        if (existingWard) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "room with this name already exists",
          });
        }

        const existingRoomType = await tx.roomType.findUnique({
          where: {
            id: roomType?.id,
          },
          select: { id: true },
        });

        if (!existingRoomType) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Room Type Not found",
            data: null,
          });
        }

        const ward = await tx.room.create({
          data: {
            name,
            description,
            status,
            roomTypeId: existingRoomType.id,
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
  { params }: { params: { roomId: string } },
) => {
  return validateRequest({
    bodySchema: partialRoomValidator,
    paramsSchema: partialRoomValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const { description, name, roomType, status } = data;
        const existingRoom = await tx.room.findUnique({
          where: { id: data.roomId },
          include: { roomType: true },
        });

        if (!existingRoom) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Room not found",
          });
        }

        if (data.name) {
          const duplicate = await tx.room.count({
            where: {
              name: data.name,
              id: { not: data.roomId },
            },
          });

          if (duplicate > 0) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "Room with same name already exists",
            });
          }
        }

        const existingRoomType = await tx.roomType.findUnique({
          where: {
            id: roomType?.id,
          },
          select: { id: true },
        });

        if (!existingRoomType) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Room Type Not found",
            data: null,
          });
        }

        const updatedWard = await tx.room.update({
          where: { id: data.roomId },
          data: {
            name,
            description,
            status,
            roomTypeId: roomType?.id,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Room Updated Successfully",
          data: updatedWard,
        });
      });
    },
  });
};

export const deleteAPI = async (
  req: Request,
  { params }: { params: { roomId: string } },
) => {
  return validateRequest({
    paramsSchema: partialRoomValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      const data = params;
      return prisma.$transaction(async (tx) => {
        const existingRoom = await tx.room.findUnique({
          where: { id: data.roomId },
        });

        if (!existingRoom) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Room not found",
          });
        }

        await prisma.room.delete({
          where: { id: data.roomId },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Room Deleted Successfully",
          data: null,
        });
      });
    },
  });
};
