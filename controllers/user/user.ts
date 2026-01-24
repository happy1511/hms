import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { apiResponse } from "@/lib/apiResponse";
import {
  partialUserValidator,
  userValidator,
  UserValidatorType,
} from "@/validators/api/masters/user";
import { generateUUID } from "@/lib/utils";
import { paginationValidator } from "@/validators/api/common/pagination";
import { Prisma } from "@/generated/prisma/client";

export const updatePermissions = async (
  permissions: UserValidatorType["permissions"],
  userId: number,
) => {
  // 2️⃣ Extract assigned (moduleId, actionId) pairs
  const assignedPairs = permissions.flatMap((p) =>
    p.actions
      .filter((a) => a.assigned)
      .map((a) => ({
        moduleId: Number(p.module.id),
        actionId: Number(a.id),
      })),
  );

  // 3️⃣ Resolve Permission IDs
  const permissionRows = assignedPairs.length
    ? await prisma.permission.findMany({
        where: {
          OR: assignedPairs,
        },
        select: { id: true },
      })
    : [];

  // Optional safety check
  if (permissionRows.length !== assignedPairs.length) {
    throw new Error("Invalid module/action permission detected");
  }

  // 4️⃣ Replace user permissions atomically
  await prisma.$transaction(async (tx) => {
    // Remove existing permissions
    await tx.userPermission.deleteMany({
      where: { userId },
    });

    // Assign new permissions
    if (permissionRows.length) {
      await tx.userPermission.createMany({
        data: permissionRows.map((p) => ({
          userId,
          permissionId: p.id,
        })),
        skipDuplicates: true,
      });
    }
  });
};

export const getAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const search = query.search ?? "";
      console.log(query, "search");

      const skip = (page - 1) * limit;
      const where: Prisma.UserWhereInput = search
        ? {
            OR: [
              { name: { contains: search } },
              { loginId: { contains: search } },
            ],
          }
        : {};

      const [items, total] = await prisma.$transaction([
        prisma.user.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
          select: {
            id: true,
            name: true,
            password: true,
            loginId: true,
            createdAt: true,
            updatedAt: true,
            permissions: {
              select: {
                permission: {
                  select: {
                    action: { select: { id: true, name: true } },
                    module: { select: { id: true, name: true } },
                  },
                },
              },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      const usersWithGroupedPermissions = items?.map((user) => {
        const moduleMap = new Map<
          number,
          {
            module: {
              name: string;
              id: number;
            };
            actions: { id: number; name: string }[];
          }
        >();

        user.permissions.forEach((up) => {
          if (up.permission) {
            const { module, action } = up.permission;

            if (!moduleMap.has(module.id)) {
              moduleMap.set(module.id, {
                module,
                actions: [],
              });
            }

            moduleMap.get(module.id)?.actions.push(action);
          }
        });

        return {
          ...user,
          permissions: Array.from(moduleMap.values()),
        };
      });

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "User Fetched Successfully",
        data: usersWithGroupedPermissions,
        total,
      });
    },
  });
};

export const getDetailsAPI = async (
  req: Request,
  { params }: { params: { id: string } },
) => {
  return validateRequest({
    paramsSchema: partialUserValidator,
    req,
    params,
    onSuccess: async ({ params }) => {
      const id = params.id;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          password: true,
          loginId: true,
          createdAt: true,
          updatedAt: true,
          status: true,
        },
      });

      if (!user) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "User not found",
        });
      }

      const permissions = await prisma.module.findMany({
        include: {
          permissions: {
            include: {
              action: true,
              userPermissions: {
                where: { userId: user?.id },
                select: { id: true },
              },
            },
          },
        },
        orderBy: { id: "asc" },
      });

      const result = permissions.map((module) => ({
        module: {
          id: module.id.toString(),
          name: module.name,
        },
        actions: module.permissions.map((perm) => ({
          id: perm.action.id.toString(),
          name: perm.action.name,
          assigned: perm.userPermissions.length > 0,
        })),
      }));

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "User Fetched Successfully",
        data: {
          ...user,
          permissions: result,
        },
      });
    },
  });
};

export const createAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: userValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      let loginId;

      while (!loginId) {
        const id = generateUUID();

        const existingUser = await prisma.user.findUnique({
          where: { loginId: id },
        });

        if (existingUser) {
          continue;
        } else {
          loginId = id;
          break;
        }
      }

      const { permissions, ...rest } = data;

      const user = await prisma.user.create({
        data: { ...rest, loginId, username: loginId },
      });

      const updatedPermissions = await updatePermissions(permissions, user.id);

      return apiResponse({
        status: RESPONSE_STATUS.CREATED,
        message: "Doctor Created Successfully",
        data: {
          ...user,
          permissions: updatedPermissions,
        },
      });
    },
  });
};

export const updateAPI = async (
  req: Request,
  { params }: { params: { id: string } },
) => {
  return validateRequest({
    bodySchema: partialUserValidator,
    paramsSchema: partialUserValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      const existingUser = await prisma.user.findUnique({
        where: { id: data.id },
      });

      if (!existingUser) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "User not found",
        });
      }

      const { permissions, ...rest } = data;

      const updatedUser = await prisma.user.update({
        where: { id: data.id },
        data: {
          ...rest,
        },
      });

      let updatedPermissions;
      if (permissions?.length) {
        updatedPermissions = await updatePermissions(permissions, data.id);
      } else {
        updatedPermissions = await prisma.userPermission.findMany({
          where: { userId: data.id },
          include: {
            permission: true,
          },
        });
      }

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "User Updated Successfully",
        data: {
          ...updatedUser,
          permissions: updatedPermissions,
        },
      });
    },
  });
};

export const deleteAPI = async (
  req: Request,
  { params }: { params: { id: string } },
) => {
  return validateRequest({
    bodySchema: partialUserValidator,
    paramsSchema: partialUserValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      const existingUser = await prisma.user.findUnique({
        where: { id: data.id },
      });

      if (!existingUser) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "User not found",
        });
      }

      await prisma.user.delete({
        where: { id: data.id },
      });

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "User Deleted Successfully",
        data: null,
      });
    },
  });
};
