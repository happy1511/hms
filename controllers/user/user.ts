import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { apiResponse } from "@/lib/apiResponse";
import {
  partialUserValidator,
  userValidator,
  UserValidatorType,
} from "@/validators/api/masters/user";
import { paginationValidator } from "@/validators/api/common/pagination";
import { Prisma, User } from "@/generated/prisma/client";
import { buildUserName, trimOptionalString } from "@/lib/user";

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
      const status = query.status ?? "";
      const createdAtFrom = query["createdAt[from]"] ?? "";
      const createdAtTo = query["createdAt[to]"] ?? "";

      const skip = (page - 1) * limit;

      const and: Prisma.UserWhereInput[] = [];

      if (search) {
        and.push(
          { name: { contains: search } },
          { loginId: { contains: search } },
        );
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

      const where: Prisma.UserWhereInput = and.length ? { AND: and } : {};

      const [items, total] = await prisma.$transaction([
        prisma.user.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
          include: {
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

      const user = await prisma.user.findFirst({
        where: { id, isDeleted: false },
        select: {
          id: true,
          name: true,
          firstName: true,
          middleName: true,
          lastName: true,
          preferredName: true,
          gender: true,
          dob: true,
          maritalStatus: true,
          address: true,
          city: true,
          country: true,
          state: true,
          postcode: true,
          contactNumber: true,
          email: true,
          identityType: true,
          identityNumber: true,
          education: true,
          qualifications: true,
          department: true,
          title: true,
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

export const createAPI = async (req: Request, actingUser: User) => {
  return validateRequest({
    bodySchema: userValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      const contactNumber = data.contactNumber.trim();

      const existingUser = await prisma.user.findUnique({
        where: { loginId: contactNumber },
      });

      if (existingUser) {
        return apiResponse({
          status: RESPONSE_STATUS.BAD_REQUEST,
          message: "User already exists for this phone number",
        });
      }

      const { permissions, ...rest } = data;
      const name = buildUserName(rest);

      const user = await prisma.user.create({
        data: {
          ...rest,
          middleName: trimOptionalString(rest.middleName),
          address: trimOptionalString(rest.address),
          city: trimOptionalString(rest.city),
          country: trimOptionalString(rest.country),
          state: trimOptionalString(rest.state),
          postcode: trimOptionalString(rest.postcode),
          email: trimOptionalString(rest.email),
          identityNumber: trimOptionalString(rest.identityNumber),
          education: trimOptionalString(rest.education),
          qualifications: trimOptionalString(rest.qualifications),
          department: trimOptionalString(rest.department),
          loginId: contactNumber,
          contactNumber,
          username: contactNumber,
          name,
          createdBy: actingUser.id ,
          updatedBy: actingUser.id ,
        },
      });

      const updatedPermissions = await updatePermissions(permissions, user.id);

      return apiResponse({
        status: RESPONSE_STATUS.CREATED,
        message: "User Created Successfully",
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
  actingUser: User,
) => {
  return validateRequest({
    bodySchema: partialUserValidator,
    paramsSchema: partialUserValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      const existingUser = await prisma.user.findFirst({
        where: { id: data.id, isDeleted: false },
      });

      if (!existingUser) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "User not found",
        });
      }

      const { permissions, ...rest } = data;
      const nextContactNumber = rest.contactNumber?.trim();

      if (
        nextContactNumber &&
        nextContactNumber !== existingUser.contactNumber
      ) {
        const duplicateUser = await prisma.user.findFirst({
          where: {
            contactNumber: nextContactNumber,
            id: { not: data.id },
          },
        });

        if (duplicateUser) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "User already exists for this phone number",
          });
        }
      }

      const updatedName =
        rest.firstName || rest.middleName || rest.lastName
          ? buildUserName({
              firstName: rest.firstName ?? existingUser.firstName,
              middleName: rest.middleName ?? existingUser.middleName,
              lastName: rest.lastName ?? existingUser.lastName,
            })
          : existingUser.name;

      const updatedUser = await prisma.user.update({
        where: { id: data.id },
        data: {
          ...rest,
          middleName:
            rest.middleName !== undefined
              ? trimOptionalString(rest.middleName)
              : undefined,
          address:
            rest.address !== undefined
              ? trimOptionalString(rest.address)
              : undefined,
          city:
            rest.city !== undefined ? trimOptionalString(rest.city) : undefined,
          country:
            rest.country !== undefined
              ? trimOptionalString(rest.country)
              : undefined,
          state:
            rest.state !== undefined
              ? trimOptionalString(rest.state)
              : undefined,
          postcode:
            rest.postcode !== undefined
              ? trimOptionalString(rest.postcode)
              : undefined,
          email:
            rest.email !== undefined
              ? trimOptionalString(rest.email)
              : undefined,
          identityNumber:
            rest.identityNumber !== undefined
              ? trimOptionalString(rest.identityNumber)
              : undefined,
          education:
            rest.education !== undefined
              ? trimOptionalString(rest.education)
              : undefined,
          qualifications:
            rest.qualifications !== undefined
              ? trimOptionalString(rest.qualifications)
              : undefined,
          department:
            rest.department !== undefined
              ? trimOptionalString(rest.department)
              : undefined,
          loginId: nextContactNumber,
          username: nextContactNumber,
          contactNumber: nextContactNumber,
          name: updatedName,
          updatedBy: actingUser.id ,
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
  actingUser: User,
) => {
  return validateRequest({
    paramsSchema: partialUserValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      const data = params;
      const existingUser = await prisma.user.findFirst({
        where: { id: data.id, isDeleted: false },
      });

      if (!existingUser) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "User not found",
        });
      }

      await prisma.user.update({
        where: { id: data.id },
        data: {
          isDeleted: true,
          deletedBy: actingUser.id ,
          updatedBy: actingUser.id ,
        },
      });

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "User Deleted Successfully",
        data: null,
      });
    },
  });
};

