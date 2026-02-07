import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { apiResponse } from "@/lib/apiResponse";
import { paginationValidator } from "@/validators/api/common/pagination";
import { Prisma } from "@/generated/prisma/client";
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
      const createdAtFrom = query["createdAt[from]"] ?? "";
      const createdAtTo = query["createdAt[to]"] ?? "";
      const wardId = query.wardId ? Number(query.wardId) : null;
      const floorId = query.floorId ? Number(query.floorId) : null;

      const skip = (page - 1) * limit;
      const and: Prisma.BedWhereInput[] = [];

      if (wardId) {
        and.push({ wardId: wardId });
      }

      if (floorId) {
        and.push({ ward: { floorId: floorId } });
      }

      if (search) {
        and.push({ bedNumber: { contains: search } });
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
            wardId: true,
            ward: {
              select: {
                name: true,
                floor: { select: { id: true, name: true } },
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

      const bed = await prisma.bed.findUnique({
        where: { id },
        select: {
          id: true,
          wardId: true,
          ward: {
            select: {
              name: true,
              floor: { select: { id: true, name: true } },
            },
          },
          bedNumber: true,
          status: true,
          occupied: true,
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

export const createAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: bedValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const existingWard = await tx.ward.findFirst({
          where: { id: data.wardId },
        });

        if (!existingWard) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Ward with this id does not exist",
          });
        }

        const { countOfBEd, wardId } = data;
        const lastBed = await tx.bed.findFirst({
          where: { wardId },
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
                wardId,
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
) => {
  return validateRequest({
    bodySchema: partialBedValidator,
    paramsSchema: partialBedValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const existingBed = await tx.bed.findUnique({
          where: { id: data.bedId },
        });

        if (!existingBed) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Bed not found",
          });
        }

        if (data.wardId) {
          const existingWard = await tx.ward.findUnique({
            where: { id: data.wardId },
          });

          if (!existingWard) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "Ward with this id does not exist",
            });
          }
        }
        const { bedId, wardId, status, occupied } = data;

        let newBedNumber = existingBed.bedNumber;

        if (existingBed.wardId !== wardId) {
          const lastBedInNewWard = await tx.bed.findFirst({
            where: { wardId },
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
            wardId,
            bedNumber: newBedNumber,
            status,
            occupied,
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
) => {
  return validateRequest({
    bodySchema: partialBedValidator,
    paramsSchema: partialBedValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      return prisma.$transaction(async (tx) => {
        const existingBed = await tx.bed.findUnique({
          where: { id: data.bedId },
        });

        if (!existingBed) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Bed not found",
          });
        }

        await prisma.bed.delete({
          where: { id: data.bedId },
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
