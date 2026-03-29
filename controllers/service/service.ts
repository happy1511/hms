import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { apiResponse } from "@/lib/apiResponse";
import { Prisma, ServiceApplicableOn, User } from "@/generated/prisma/client";
import {
  partialServiceValidator,
  serviceListValidator,
  serviceValidator,
} from "@/validators/api/masters/service";
import { isProtectedService } from "@/lib/systemBillingConstants";

export const getAPI = async (req: Request) => {
  return validateRequest({
    querySchema: serviceListValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const search = query.search ?? "";
      const status = query.status ?? "";
      const doctorId = query.doctorId;
      const isInvoiceOnly =
        typeof query.isInvoiceOnly === "boolean" ? query.isInvoiceOnly : false;
      const createdAtFrom = query["createdAt[from]"] ?? "";
      const createdAtTo = query["createdAt[to]"] ?? "";

      const skip = (page - 1) * limit;
      const and: Prisma.ServiceWhereInput[] = [];

      if (search) {
        and.push({ name: { contains: search } });
      }
      and.push({ isDeleted: false });

      if (status) {
        and.push({ status: { equals: status } });
      }

      and.push({ isInvoiceOnly });

      if (doctorId) {
        and.push({ consultingDoctorId: { equals: doctorId } });
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
            isInvoiceOnly: true,
            createdAt: true,
            updatedAt: true,
            type: true,
            price: true,
            discountAvailable: true,
            maxDiscount: true,
            consultingDoctorId: true,
            roomId: true,
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

      const service = await prisma.service.findFirst({
        where: { id, isDeleted: false },
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          isInvoiceOnly: true,
          price: true,
          roomId: true,
          consultingDoctorId: true,
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

export const createAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: serviceValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const existingService = await tx.service.findFirst({
          where: { name: data.name, isDeleted: false },
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
          isInvoiceOnly,
        } = data;

        if (connectedLabTests) {
          const existingLabTests = await tx.pathologyTest.findMany({
            where: {
              id: { in: connectedLabTests?.map((t) => t.id) },
              isDeleted: false,
            },
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
            where: {
              id: { in: connectedRadiologyTests?.map((t) => t.id) },
              isDeleted: false,
            },
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
            isInvoiceOnly: Boolean(isInvoiceOnly),
            status,
            maxDiscount,
            price,
            type,
            discountAvailable,
            applicableOn: applicableOn || ServiceApplicableOn["BOTH"],
            pathologyTests: {
              create: connectedLabTests?.map((test) => ({
                testId: test.id,
              })),
            },
            radiologyTests: {
              create: connectedRadiologyTests?.map((test) => ({
                testId: test.id,
              })),
            },
            createdBy: user.id ,
            updatedBy: user.id ,
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
  user: User,
) => {
  return validateRequest({
    bodySchema: partialServiceValidator,
    paramsSchema: partialServiceValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const existingService = await tx.service.findFirst({
          where: { id: data.serviceId, isDeleted: false },
        });

        if (!existingService) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Service not found",
          });
        }

        if (isProtectedService(existingService)) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Protected services cannot be deleted",
          });
        }

        const {
          name,
          description,
          status,
          isInvoiceOnly,
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
            where: {
              id: { in: connectedLabTests?.map((t) => t.id) },
              isDeleted: false,
            },
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
            where: {
              id: { in: connectedRadiologyTests?.map((t) => t.id) },
              isDeleted: false,
            },
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
            isInvoiceOnly,
            status,
            maxDiscount,
            price,
            applicableOn,
            type,
            discountAvailable,
            pathologyTests: {
              deleteMany: {},
              create: connectedLabTests?.map((test) => ({
                testId: test.id,
              })),
            },
            radiologyTests: {
              deleteMany: {},
              create: connectedRadiologyTests?.map((test) => ({
                testId: test.id,
              })),
            },
            updatedBy: user.id ,
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
  user: User,
) => {
  return validateRequest({
    paramsSchema: partialServiceValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      const data = params;
      return prisma.$transaction(async (tx) => {
        const existingService = await tx.service.findFirst({
          where: { id: data.serviceId, isDeleted: false },
        });

        if (!existingService) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Service not found",
          });
        }

        await tx.service.update({
          where: { id: data.serviceId },
          data: {
            isDeleted: true,
            deletedBy: user.id ,
            updatedBy: user.id ,
          },
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

