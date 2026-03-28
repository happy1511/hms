import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { apiResponse } from "@/lib/apiResponse";
import { paginationValidator } from "@/validators/api/common/pagination";
import { Prisma, User } from "@/generated/prisma/client";
import {
  partialRoomValidator,
  roomValidator,
} from "@/validators/api/masters/room";
import { upsertRoomChargeService } from "@/lib/systemBilling";

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
      and.push({ isDeleted: false });

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
            price: true,
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

      const room = await prisma.room.findFirst({
        where: { id, isDeleted: false },
        select: {
          id: true,
          roomType: true,
          description: true,
          name: true,
          price: true,
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
export const createAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: roomValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const { name, roomType, status, description, price } = data;
        const existingWard = await tx.room.findFirst({
          where: { name: data.name, isDeleted: false },
        });

        if (existingWard) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "room with this name already exists",
          });
        }

        const existingRoomType = await tx.roomType.findFirst({
          where: {
            id: roomType?.id,
            isDeleted: false,
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
            price,
            status,
            roomTypeId: existingRoomType.id,
            createdBy: user.id ,
            updatedBy: user.id ,
          },
        });

        await upsertRoomChargeService(tx, {
          roomId: ward.id,
          roomName: ward.name,
          roomPrice: Number(ward.price ?? 0),
          actingUserId: user.id,
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
  user: User,
) => {
  return validateRequest({
    bodySchema: partialRoomValidator,
    paramsSchema: partialRoomValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const { description, name, roomType, status, price } = data;
        const existingRoom = await tx.room.findFirst({
          where: { id: data.roomId, isDeleted: false },
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
              isDeleted: false,
            },
          });

          if (duplicate > 0) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "Room with same name already exists",
            });
          }
        }

        const existingRoomType = await tx.roomType.findFirst({
          where: {
            id: roomType?.id,
            isDeleted: false,
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
            price,
            status,
            roomTypeId: roomType?.id,
            updatedBy: user.id ,
          },
        });

        await upsertRoomChargeService(tx, {
          roomId: updatedWard.id,
          roomName: updatedWard.name,
          roomPrice: Number(updatedWard.price ?? 0),
          actingUserId: user.id,
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
  user: User,
) => {
  return validateRequest({
    paramsSchema: partialRoomValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      const data = params;
      return prisma.$transaction(async (tx) => {
        const existingRoom = await tx.room.findFirst({
          where: { id: data.roomId, isDeleted: false },
        });

        if (!existingRoom) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Room not found",
          });
        }

        await tx.room.update({
          where: { id: data.roomId },
          data: {
            isDeleted: true,
            deletedBy: user.id ,
            updatedBy: user.id ,
          },
        });

        await tx.service.updateMany({
          where: { roomId: data.roomId, isDeleted: false },
          data: {
            isDeleted: true,
            deletedBy: user.id,
            updatedBy: user.id,
          },
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

