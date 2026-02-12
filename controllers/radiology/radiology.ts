import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { apiResponse } from "@/lib/apiResponse";
import { paginationValidator } from "@/validators/api/common/pagination";
import { Prisma } from "@/generated/prisma/client";
import {
  partialRadiologyTemplateValidator,
  partialRadiologyTestValidator,
  radiologyTemplateValidator,
  radiologyTestValidator,
} from "@/validators/api/masters/radiologyTest";

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
      const sectionType = query.radiologyTestType ?? "";

      const skip = (page - 1) * limit;
      const and: Prisma.RadiologyTestWhereInput[] = [];

      if (search) {
        and.push({ name: { contains: search } });
      }

      if (status) {
        and.push({ status: { equals: status } });
      }

      if (sectionType) {
        and.push({
          section: { equals: sectionType },
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

      const where: Prisma.RadiologyTestWhereInput = and.length
        ? { AND: and }
        : {};

      const [items, total] = await prisma.$transaction([
        prisma.radiologyTest.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
          select: {
            id: true,
            name: true,
            alias: true,
            price: true,
            section: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.radiologyTest.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Radiology Tests Fetched Successfully",
        data: items,
        total,
      });
    },
  });
};

export const createAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: radiologyTestValidator,
    req,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const existingTest = await tx.radiologyTest.findFirst({
          where: { name: body.name },
        });

        if (existingTest) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Test with this name already exists",
          });
        }

        const createdTest = await tx.radiologyTest.create({
          data: {
            name: body.name,
            alias: body.alias,
            price: body.price,
            status: body.status,
            section: body.section,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Radiology Test Created Successfully",
          data: createdTest,
        });
      });
    },
  });
};

export const deleteAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: partialRadiologyTestValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      return prisma.$transaction(async (tx) => {
        const existingTest = await tx.radiologyTest.findUnique({
          where: { id: data.testId },
        });

        if (!existingTest) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Radiology Test not found",
          });
        }

        await prisma.radiologyTest.delete({
          where: { id: data.testId },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Radiology Test Deleted Successfully",
          data: null,
        });
      });
    },
  });
};

export const getTemplatesAPI = async (req: Request) => {
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
      const sectionType = query.radiologyTestType ?? "";

      const skip = (page - 1) * limit;
      const and: Prisma.RadiologyTemplateWhereInput[] = [];

      if (search) {
        and.push({ name: { contains: search } });
      }

      if (status) {
        and.push({ status: { equals: status } });
      }

      if (sectionType) {
        and.push({
          section: { equals: sectionType },
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

      const where: Prisma.RadiologyTemplateWhereInput = and.length
        ? { AND: and }
        : {};

      const [items, total] = await prisma.$transaction([
        prisma.radiologyTemplate.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
          select: {
            id: true,
            name: true,
            section: true,
            content: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.radiologyTemplate.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Radiology Templates Fetched Successfully",
        data: items,
        total,
      });
    },
  });
};

export const getTemplateDetailsAPI = async (
  req: Request,
  { params }: { params: { templateId: number } },
) => {
  return validateRequest({
    paramsSchema: partialRadiologyTemplateValidator,
    req,
    params,
    onSuccess: async ({ params }) => {
      return prisma.$transaction(async (tx) => {
        const existingTest = await tx.radiologyTemplate.findUnique({
          where: { id: params.templateId },
        });

        if (!existingTest) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Radiology Template not found",
          });
        }

        const template = await prisma.radiologyTemplate.findUnique({
          where: { id: params.templateId },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Radiology Template Fetched Successfully",
          data: template,
        });
      });
    },
  });
};

export const createTemplateAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: radiologyTemplateValidator,
    req,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const existingTest = await tx.radiologyTemplate.findFirst({
          where: { name: body.name },
        });

        if (existingTest) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Template with this name already exists",
          });
        }

        const createdTest = await tx.radiologyTemplate.create({
          data: {
            name: body.name,
            section: body.section,
            status: body.status,
            content: body.content,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Radiology Template Created Successfully",
          data: createdTest,
        });
      });
    },
  });
};

export const deleteTemplateAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: partialRadiologyTemplateValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      return prisma.$transaction(async (tx) => {
        const existingTest = await tx.radiologyTemplate.findUnique({
          where: { id: data.templateId },
        });

        if (!existingTest) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Radiology Template not found",
          });
        }

        await prisma.radiologyTemplate.delete({
          where: { id: data.templateId },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Radiology Template Deleted Successfully",
          data: null,
        });
      });
    },
  });
};

export const updateTemplateAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: partialRadiologyTemplateValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      return prisma.$transaction(async (tx) => {
        const existingTest = await tx.radiologyTemplate.findUnique({
          where: { id: data.templateId },
        });

        if (!existingTest) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Radiology Template not found",
          });
        }

        await prisma.radiologyTemplate.delete({
          where: { id: data.templateId },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Radiology Template Deleted Successfully",
          data: null,
        });
      });
    },
  });
};
