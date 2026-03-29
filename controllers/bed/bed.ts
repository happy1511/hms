import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { apiResponse } from "@/lib/apiResponse";
import { paginationValidator } from "@/validators/api/common/pagination";
import { Prisma, User } from "@/generated/prisma/client";
import {
  bedValidator,
  partialBedValidator,
} from "@/validators/api/masters/bed";

export const getAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const search = query.search ?? "";
      const status = query.status ?? "";
      const nonOccupied = query.nonOccupied ?? "";
      const createdAtFrom = query["createdAt[from]"] ?? "";
      const createdAtTo = query["createdAt[to]"] ?? "";
      const roomId = query.roomId ? Number(query.roomId) : null;
      const roomTypeId = query.roomTypeId ? Number(query.roomTypeId) : null;
      const departmentId = query.departmentId
        ? Number(query.departmentId)
        : null;

      const skip = (page - 1) * limit;
      const and: Prisma.BedWhereInput[] = [];

      if (roomId) {
        and.push({ roomId: roomId });
      }
      and.push({ isDeleted: false });

      if (roomTypeId) {
        and.push({ room: { roomTypeId } });
      }

      if (typeof nonOccupied == "boolean" && nonOccupied) {
        and.push({ isOccupied: false });
      }

      if (departmentId) {
        and.push({ room: { roomType: { departmentId: departmentId } } });
      }

      if (search) {
        and.push({
          OR: [
            { bedNumber: { contains: search } },
            { room: { name: { contains: search } } },
            { room: { roomType: { name: { contains: search } } } },
            {
              room: {
                roomType: { department: { name: { contains: search } } },
              },
            },
          ],
        });
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

      const where: Prisma.BedWhereInput = and.length ? { AND: and } : {};

      const [items, total] = await prisma.$transaction([
        prisma.bed.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
          select: {
            id: true,
            bedNumber: true,
            roomId: true,
            room: {
              select: {
                name: true,
                roomType: {
                  select: {
                    id: true,
                    name: true,
                    department: { select: { id: true, name: true } },
                  },
                },
              },
            },
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.bed.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Bed Fetched Successfully",
        data: items,
        total,
      });
    },
  });
};

export const getAvailabilityAPI = async (req: Request) => {
  try {
    const roomTypes = await prisma.room.findMany({
      where: { isDeleted: false },
      select: {
        id: true,
        name: true,
        beds: {
          where: { isDeleted: false },
          select: {
            id: true,
            bedNumber: true,
            name: true,
            isOccupied: true,
            currentIpdId: true,
            currentIpd: {
              select: {
                createdAt: true,
                patient: {
                  select: {
                    firstName: true,
                    middleName: true,
                    lastName: true,
                    dob: true,
                    maritalStatus: true,
                    contacts: true,
                    relations: true,
                    addresses: true,
                    emergencyContacts: true,
                  },
                },
              },
            },
          },
          orderBy: { bedNumber: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    return apiResponse({
      status: RESPONSE_STATUS.SUCCESS,
      message: "Bed Availability Fetched Successfully",
      data: roomTypes,
    });
  } catch (error) {
    console.error("Error fetching bed availability:", error);
    return apiResponse({
      status: RESPONSE_STATUS.INTERNAL_SERVER_ERROR,
      message: "Failed to fetch bed availability",
    });
  }
};

export const getDetailsAPI = async (
  req: Request,
  { params }: { params: { bedId: number } },
) => {
  return validateRequest({
    paramsSchema: partialBedValidator,
    req,
    params,
    onSuccess: async ({ params }) => {
      const id = params.bedId;

      const bed = await prisma.bed.findFirst({
        where: { id, isDeleted: false },
        select: {
          id: true,
          room: {
            select: {
              id: true,
              name: true,
              roomType: { select: { id: true, name: true } },
            },
          },
          bedNumber: true,
          status: true,
        },
      });

      if (!bed) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Bed not found",
        });
      }

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Bed Fetched Successfully",
        data: bed,
      });
    },
  });
};

export const createAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: bedValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const existingWard = await tx.room.findFirst({
          where: { id: data.room.id, isDeleted: false },
        });

        if (!existingWard) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Ward with this id does not exist",
          });
        }

        const { countOfBEd, room } = data;
        const lastBed = await tx.bed.findFirst({
          where: { roomId: room.id, isDeleted: false },
          orderBy: { id: "desc" },
        });

        const lastNumber = lastBed
          ? parseInt(lastBed.bedNumber.split("-")[1])
          : 0;

        const createdBeds = await Promise.all(
          Array.from({ length: countOfBEd }).map((_, index) => {
            const bedNumber = `Bed-${lastNumber + index + 1}`;
            return tx.bed.create({
              data: {
                bedNumber,
                roomId: room.id,
                createdBy: user.id,
                updatedBy: user.id,
              },
            });
          }),
        );

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Beds Created Successfully",
          data: createdBeds,
        });
      });
    },
  });
};

export const updateAPI = async (
  req: Request,
  { params }: { params: { bedId: number } },
  user: User,
) => {
  return validateRequest({
    bodySchema: partialBedValidator,
    paramsSchema: partialBedValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const { bedId, room, status, occupied } = data;
        const existingBed = await tx.bed.findFirst({
          where: { id: bedId, isDeleted: false },
        });

        if (!existingBed) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Bed not found",
          });
        }

        if (room?.id) {
          const existingWard = await tx.room.findFirst({
            where: { id: room.id, isDeleted: false },
          });

          if (!existingWard) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "Ward with this id does not exist",
            });
          }
        }

        let newBedNumber = existingBed.bedNumber;

        if (existingBed.roomId !== room?.id) {
          const lastBedInNewWard = await tx.bed.findFirst({
            where: { roomId: room?.id, isDeleted: false },
            orderBy: { id: "desc" },
          });

          const lastNumber = lastBedInNewWard
            ? parseInt(lastBedInNewWard.bedNumber.split("-")[1])
            : 0;

          newBedNumber = `Bed-${lastNumber + 1}`;
        }

        const updatedBed = await tx.bed.update({
          where: { id: bedId },
          data: {
            roomId: room?.id,
            bedNumber: newBedNumber,
            status,
            updatedBy: user.id,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Bed Updated Successfully",
          data: updatedBed,
        });
      });
    },
  });
};

export const deleteAPI = async (
  req: Request,
  { params }: { params: { bedId: number } },
  user: User,
) => {
  return validateRequest({
    paramsSchema: partialBedValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      const data = params;
      return prisma.$transaction(async (tx) => {
        const existingBed = await tx.bed.findFirst({
          where: { id: data.bedId, isDeleted: false },
        });

        if (!existingBed) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Bed not found",
          });
        }

        await tx.bed.update({
          where: { id: data.bedId },
          data: {
            isDeleted: true,
            deletedBy: user.id,
            updatedBy: user.id,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Bed Deleted Successfully",
          data: null,
        });
      });
    },
  });
};
