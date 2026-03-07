import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { apiResponse } from "@/lib/apiResponse";
import { paginationValidator } from "@/validators/api/common/pagination";
import {
  departmentValidator,
  partialDepartmentValidator,
} from "@/validators/api/masters/department";
import { Prisma, User } from "@/generated/prisma/client";

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
      const and: Prisma.DepartmentWhereInput[] = [];

      if (search) {
        and.push({ name: { contains: search } });
      }
      and.push({ isDeleted: false });

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

      const where: Prisma.DepartmentWhereInput = and.length ? { AND: and } : {};

      const [items, total] = await prisma.$transaction([
        prisma.department.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
        }),
        prisma.department.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "department Fetched Successfully",
        data: items,
        total,
      });
    },
  });
};

export const getDetailsAPI = async (
  req: Request,
  { params }: { params: { departmentId: string } },
) => {
  return validateRequest({
    paramsSchema: partialDepartmentValidator,
    req,
    params,
    onSuccess: async ({ params }) => {
      const id = params.departmentId;

      const department = await prisma.department.findFirst({
        where: { id, isDeleted: false },
      });

      if (!department) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "department not found",
        });
      }

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "department Fetched Successfully",
        data: department,
      });
    },
  });
};

export const createAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: departmentValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const existingDepartment = await tx.department.findFirst({
          where: { name: data.name, isDeleted: false },
        });

        if (existingDepartment) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "department with this name already exists",
          });
        }

        const { name, status, description } = data;

        const department = await tx.department.create({
          data: {
            name,
            description,
            status,
            createdBy: user.id ,
            updatedBy: user.id ,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "department Created Successfully",
          data: department,
        });
      });
    },
  });
};

export const updateAPI = async (
  req: Request,
  { params }: { params: { departmentId: string } },
  user: User,
) => {
  return validateRequest({
    bodySchema: partialDepartmentValidator,
    paramsSchema: partialDepartmentValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const existingDepartment = await tx.department.findFirst({
          where: { id: data.departmentId, isDeleted: false },
          include: { roomTypes: true },
        });

        if (!existingDepartment) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "department not found",
          });
        }

        if (data.name) {
          const duplicate = await tx.department.count({
            where: {
              name: data.name,
              id: { not: data.departmentId },
              isDeleted: false,
            },
          });

          if (duplicate > 0) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "department with same name already exists",
            });
          }
        }

        const { description, status, name } = data;

        const updatedDepartment = await tx.department.update({
          where: { id: data.departmentId },
          data: {
            name,
            description,
            status,
            updatedBy: user.id ,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "department Updated Successfully",
          data: updatedDepartment,
        });
      });
    },
  });
};

export const deleteAPI = async (
  req: Request,
  { params }: { params: { departmentId: string } },
  user: User,
) => {
  return validateRequest({
    paramsSchema: partialDepartmentValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      const data = params;
      return prisma.$transaction(async (tx) => {
        const existingDepartment = await tx.department.findFirst({
          where: { id: data.departmentId, isDeleted: false },
        });

        if (!existingDepartment) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "department not found",
          });
        }

        await tx.department.update({
          where: { id: data.departmentId },
          data: {
            isDeleted: true,
            deletedBy: user.id ,
            updatedBy: user.id ,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "department Deleted Successfully",
          data: null,
        });
      });
    },
  });
};

