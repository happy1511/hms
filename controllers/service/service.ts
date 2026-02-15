import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { apiResponse } from "@/lib/apiResponse";
import { paginationValidator } from "@/validators/api/common/pagination";
import { Prisma, ServiceApplicableOn } from "@/generated/prisma/client";
import {
  partialServiceValidator,
  serviceValidator,
} from "@/validators/api/masters/service";

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
      const billingSectionId = query.billingSectionId ?? "";

      const skip = (page - 1) * limit;
      const and: Prisma.ServiceWhereInput[] = [];

      if (search) {
        and.push({ name: { contains: search } });
      }

      if (status) {
        and.push({ status: { equals: status } });
      }

      if (billingSectionId) {
        and.push({
          billingSections: { some: { id: Number(billingSectionId) } },
        });
      }

      if (createdAtFrom || createdAtTo) {
        and.push({
          createdAt: {
            ...(createdAtFrom && { gte: createdAtFrom }),
            ...(createdAtTo && { lte: createdAtTo }),
          },
        });
      }

      const where: Prisma.ServiceWhereInput = and.length ? { AND: and } : {};

      const [items, total] = await prisma.$transaction([
        prisma.service.findMany({
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
            type: true,
            price: true,
            discountAvailable: true,
            maxDiscount: true,
            pathologyTests: {
              select: {
                test: { select: { name: true } },
              },
            },
            radiologyTests: {
              select: {
                test: { select: { name: true } },
              },
            },
          },
        }),
        prisma.service.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Services Fetched Successfully",
        data: items,
        total,
      });
    },
  });
};

export const getDetailsAPI = async (
  req: Request,
  { params }: { params: { serviceId: number } },
) => {
  return validateRequest({
    paramsSchema: partialServiceValidator,
    req,
    params,
    onSuccess: async ({ params }) => {
      const id = params.serviceId;

      const service = await prisma.service.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          price: true,
          discountAvailable: true,
          maxDiscount: true,
          pathologyTests: {
            select: {
              id: true,
              serviceId: true,
              testId: true,
              test: {
                select: {
                  id: true,
                  name: true,
                  status: true,
                },
              },
            },
          },
          radiologyTests: {
            select: {
              id: true,
              serviceId: true,
              testId: true,
              test: {
                select: {
                  id: true,
                  name: true,
                  status: true,
                },
              },
            },
          },
        },
      });

      if (!service) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Service not found",
        });
      }

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Service Fetched Successfully",
        data: service,
      });
    },
  });
};

export const createAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: serviceValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const existingService = await tx.service.findFirst({
          where: { name: data.name },
        });

        if (existingService) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Service with this name already exists",
          });
        }

        const {
          name,
          description,
          status,
          maxDiscount,
          price,
          applicableOn,
          type,
          connectedLabTests,
          connectedRadiologyTests,
          discountAvailable,
        } = data;

        if (connectedLabTests) {
          const existingLabTests = await tx.pathologyTest.findMany({
            where: { id: { in: connectedLabTests } },
            select: { id: true },
          });
          if (existingLabTests.length !== connectedLabTests.length) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "One or more lab tests do not exist",
            });
          }
        }

        if (connectedRadiologyTests) {
          const existingRadiologyTests = await tx.radiologyTest.findMany({
            where: { id: { in: connectedRadiologyTests } },
            select: { id: true },
          });
          if (
            existingRadiologyTests.length !== connectedRadiologyTests.length
          ) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "One or more radiology tests do not exist",
            });
          }
        }

        const createdService = await tx.service.create({
          data: {
            name,
            description,
            status,
            maxDiscount,
            price,
            type,
            discountAvailable,
            applicableOn: applicableOn || ServiceApplicableOn["BOTH"],
            pathologyTests: {
              create: connectedLabTests?.map((testId: number) => ({
                testId,
              })),
            },
            radiologyTests: {
              create: connectedRadiologyTests?.map((testId: number) => ({
                testId,
              })),
            },
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Service Created Successfully",
          data: createdService,
        });
      });
    },
  });
};

export const updateAPI = async (
  req: Request,
  { params }: { params: { serviceId: number } },
) => {
  return validateRequest({
    bodySchema: partialServiceValidator,
    paramsSchema: partialServiceValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const existingService = await tx.service.findUnique({
          where: { id: data.serviceId },
        });

        if (!existingService) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Service not found",
          });
        }

        const {
          name,
          description,
          status,
          maxDiscount,
          price,
          applicableOn,
          type,
          discountAvailable,
          connectedLabTests,
          connectedRadiologyTests,
        } = data;

        if (connectedLabTests) {
          const existingLabTests = await tx.pathologyTest.findMany({
            where: { id: { in: connectedLabTests } },
            select: { id: true },
          });
          if (existingLabTests.length !== connectedLabTests.length) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "One or more lab tests do not exist",
            });
          }
        }

        if (connectedRadiologyTests) {
          const existingRadiologyTests = await tx.radiologyTest.findMany({
            where: { id: { in: connectedRadiologyTests } },
            select: { id: true },
          });
          if (
            existingRadiologyTests.length !== connectedRadiologyTests.length
          ) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "One or more radiology tests do not exist",
            });
          }
        }

        const updatedService = await tx.service.update({
          where: { id: data.serviceId },
          data: {
            name,
            description,
            status,
            maxDiscount,
            price,
            applicableOn,
            type,
            discountAvailable,
            pathologyTests: {
              deleteMany: {},
              create: connectedLabTests?.map((testId: number) => ({
                testId,
              })),
            },
            radiologyTests: {
              deleteMany: {},
              create: connectedRadiologyTests?.map((testId: number) => ({
                testId,
              })),
            },
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Service Updated Successfully",
          data: updatedService,
        });
      });
    },
  });
};

export const deleteAPI = async (
  req: Request,
  { params }: { params: { serviceId: number } },
) => {
  return validateRequest({
    bodySchema: partialServiceValidator,
    paramsSchema: partialServiceValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      return prisma.$transaction(async (tx) => {
        const existingService = await tx.service.findUnique({
          where: { id: data.serviceId },
        });

        if (!existingService) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Service not found",
          });
        }

        await prisma.service.delete({
          where: { id: data.serviceId },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Service Deleted Successfully",
          data: null,
        });
      });
    },
  });
};
