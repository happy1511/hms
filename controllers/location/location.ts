import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { apiResponse } from "@/lib/apiResponse";
import { paginationValidator } from "@/validators/api/common/pagination";
import { Prisma, User } from "@/generated/prisma/client";
import {
  locationValidator,
  partialLocationValidator,
} from "@/validators/api/masters/location";

export const getAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const search = query.search ?? "";
      const status = query.status ?? "";

      const skip = (page - 1) * limit;
      const and: Prisma.LocationWhereInput[] = [];

      if (search) {
        and.push({
          OR: [
            {
              city: { contains: search },
            },
            {
              state: { contains: search },
            },
            {
              postcode: { contains: search },
            },
          ],
        });
      }
      and.push({ isDeleted: false });

      const where: Prisma.LocationWhereInput = and.length ? { AND: and } : {};

      const [items, total] = await prisma.$transaction([
        prisma.location.findMany({
          skip,
          take: limit,
          where,
          select: {
            id: true,
            city: true,
            state: true,
            postcode: true,
            country: true,
          },
        }),
        prisma.location.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Locations Fetched Successfully",
        data: items,
        total,
      });
    },
  });
};

export const createAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: locationValidator,
    req,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const location = await tx.location.create({
          data: {
            ...body,
            createdBy: user.id ,
            updatedBy: user.id ,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Location Created Successfully",
          data: location,
        });
      });
    },
  });
};

export const updateAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: partialLocationValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const existingLocation = await tx.location.findFirst({
          where: { id: data.id, isDeleted: false },
        });

        if (!existingLocation) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Bed not found",
          });
        }

        const updatedLocation = await tx.location.update({
          where: { id: data.id },
          data: {
            ...body,
            updatedBy: user.id ,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Location Updated Successfully",
          data: updatedLocation,
        });
      });
    },
  });
};

export const deleteAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: partialLocationValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      return prisma.$transaction(async (tx) => {
        const existingLocation = await tx.location.findFirst({
          where: { id: data.id, isDeleted: false },
        });

        if (!existingLocation) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Location not found",
          });
        }

        await tx.location.update({
          where: { id: data.id },
          data: {
            isDeleted: true,
            deletedBy: user.id ,
            updatedBy: user.id ,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Location Deleted Successfully",
          data: null,
        });
      });
    },
  });
};

