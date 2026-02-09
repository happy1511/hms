import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { apiResponse } from "@/lib/apiResponse";
import { paginationValidator } from "@/validators/api/common/pagination";
import { Prisma } from "@/generated/prisma/client";
import {
  billingSectionValidator,
  partialBillingSectionValidator,
} from "@/validators/api/masters/billingSection";

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
      const and: Prisma.BillingSectionWhereInput[] = [];

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

      const where: Prisma.BillingSectionWhereInput = and.length
        ? { AND: and }
        : {};

      const [items, total] = await prisma.$transaction([
        prisma.billingSection.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.billingSection.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Billing Section Fetched Successfully",
        data: items,
        total,
      });
    },
  });
};

export const getDetailsAPI = async (
  req: Request,
  { params }: { params: { sectionId: number } },
) => {
  return validateRequest({
    paramsSchema: partialBillingSectionValidator,
    req,
    params,
    onSuccess: async ({ params }) => {
      const id = params.sectionId;

      const billingSection = await prisma.billingSection.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          services: {
            select: { service: { select: { id: true, name: true } } },
          },
        },
      });

      if (!billingSection) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Billing Section not found",
        });
      }

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Billing Section Fetched Successfully",
        data: billingSection,
      });
    },
  });
};

export const createAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: billingSectionValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const existingBillingSection = await tx.billingSection.findFirst({
          where: { name: data.name },
        });

        if (existingBillingSection) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Billing Section with this name already exists",
          });
        }

        const { name, description, status, serviceIds } = data;
        if (serviceIds) {
          const existingServices = await tx.service.findMany({
            where: { id: { in: serviceIds } },
            select: { id: true },
          });
          if (existingServices.length !== serviceIds.length) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "One or more services do not exist",
            });
          }
        }

        const createdBillingSection = await tx.billingSection.create({
          data: {
            name,
            description,
            status,
            services: {
              create: serviceIds?.map((serviceId) => ({
                service: {
                  connect: { id: serviceId },
                },
              })),
            },
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Billing Section Created Successfully",
          data: createdBillingSection,
        });
      });
    },
  });
};

export const updateAPI = async (
  req: Request,
  { params }: { params: { sectionId: number } },
) => {
  return validateRequest({
    bodySchema: partialBillingSectionValidator,
    paramsSchema: partialBillingSectionValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const existingBillingSection = await tx.billingSection.findUnique({
          where: { id: data.sectionId },
        });

        if (!existingBillingSection) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Billing Section not found",
          });
        }

        const { name, description, status, serviceIds } = data;
        if (serviceIds) {
          const existingServices = await tx.service.findMany({
            where: { id: { in: serviceIds } },
            select: { id: true },
          });
          if (existingServices.length !== serviceIds.length) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "One or more services do not exist",
            });
          }
        }

        const updatedBillingSection = await tx.billingSection.update({
          where: { id: data.sectionId },
          data: {
            name,
            description,
            status,
            services: data.serviceIds
              ? {
                  deleteMany: {},
                  create: serviceIds?.map((serviceId) => ({
                    service: {
                      connect: { id: serviceId },
                    },
                  })),
                }
              : undefined,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Billing Section Updated Successfully",
          data: updatedBillingSection,
        });
      });
    },
  });
};

export const deleteAPI = async (
  req: Request,
  { params }: { params: { sectionId: number } },
) => {
  return validateRequest({
    bodySchema: partialBillingSectionValidator,
    paramsSchema: partialBillingSectionValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      return prisma.$transaction(async (tx) => {
        const existingBillingSection = await tx.billingSection.findUnique({
          where: { id: data.sectionId },
        });

        if (!existingBillingSection) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Billing Section not found",
          });
        }

        await prisma.billingSection.delete({
          where: { id: data.sectionId },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Billing Section Deleted Successfully",
          data: null,
        });
      });
    },
  });
};
