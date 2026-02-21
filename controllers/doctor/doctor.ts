import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { apiResponse } from "@/lib/apiResponse";
import {
  doctorValidator,
  DoctorValidatorType,
  partialDoctorValidator,
} from "@/validators/api/masters/doctor";
import { generateUUID } from "@/lib/utils";
import { updatePermissions } from "../user/user";
import { paginationValidator } from "@/validators/api/common/pagination";
import { Days, Prisma } from "@/generated/prisma/client";

export const updateAvailability = async (
  availableDays: DoctorValidatorType["availableDays"],
  userId: number,
) => {
  // 2️⃣ Extract assigned (moduleId, actionId) pairs
  const availabilityPairs = availableDays?.filter((p) => p.available);

  // 4️⃣ Replace user permissions atomically
  await prisma.$transaction(async (tx) => {
    // Remove existing permissions
    await tx.doctorAvailableDay.deleteMany({
      where: { doctorId: userId },
    });

    // Assign new permissions
    if (availabilityPairs?.length) {
      await tx.doctorAvailableDay.createMany({
        data: availabilityPairs.map((p) => ({
          doctorId: userId,
          day: p.day,
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
      const doctorType = query.doctorType ?? "";
      const createdAtFrom = query["createdAt[from]"] ?? "";
      const createdAtTo = query["createdAt[to]"] ?? "";

      const skip = (page - 1) * limit;
      const and: Prisma.DoctorWhereInput[] = [];

      if (search) {
        and.push(
          { user: { name: { contains: search } } },
          { user: { loginId: { contains: search } } },
        );
      }

      if (status) {
        and.push({ user: { status: { equals: status } } });
      }

      if (doctorType) {
        and.push({ doctorType: { equals: doctorType } });
      }

      if (createdAtFrom || createdAtTo) {
        and.push({
          user: {
            createdAt: {
              ...(createdAtFrom && { gte: createdAtFrom }),
              ...(createdAtTo && { lte: createdAtTo }),
            },
          },
        });
      }

      const where: Prisma.DoctorWhereInput = and.length ? { AND: and } : {};

      const [items, total] = await prisma.$transaction([
        prisma.doctor.findMany({
          skip,
          take: limit,
          orderBy: { user: { createdAt: "desc" } },
          where,
          select: {
            userId: true,
            user: true,
            availableDays: true,
            licenseNumber: true,
            doctorType: true,
          },
        }),
        prisma.doctor.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Doctor Fetched Successfully",
        data: items,
        total,
      });
    },
  });
};

export const getDetailsAPI = async (
  req: Request,
  { params }: { params: { userId: string } },
) => {
  return validateRequest({
    paramsSchema: partialDoctorValidator,
    req,
    params,
    onSuccess: async ({ params }) => {
      const id = params.userId;

      const doctor = await prisma.doctor.findUnique({
        where: { userId: id },
        select: {
          user: true,
          userId: true,
          availableDays: true,
          licenseNumber: true,
          consultationEndingTime: true,
          consultationStartingTime: true,
          department: true,
          designation: true,
          doctorType: true,
          email: true,
          emergencyContact: true,
          phoneNumber: true,
          qualifications: true,
          specialization: true,
          yearsExperience: true,
        },
      });

      if (!doctor) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Doctor not found",
        });
      }

      const permissions = await prisma.module.findMany({
        include: {
          permissions: {
            include: {
              action: true,
              userPermissions: {
                where: { userId: doctor?.userId },
                select: { id: true },
              },
            },
          },
        },
        orderBy: { id: "asc" },
      });

      const permissionsResult = permissions.map((module) => ({
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

      const availabilityResult = Object.values(Days).map((d) => ({
        day: d,
        available:
          doctor.availableDays.findIndex((day) => day.day === d) !== -1,
      }));

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "User Fetched Successfully",
        data: {
          ...doctor,
          user: { ...doctor.user, permissions: permissionsResult },
          availableDays: availabilityResult,
        },
      });
    },
  });
};

export const createAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: doctorValidator,
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

      const existingDoctor = await prisma.doctor.findFirst({
        where: {
          OR: [
            {
              licenseNumber: data.licenseNumber,
            },
            {
              phoneNumber: data.phoneNumber,
            },
          ],
        },
      });

      if (existingDoctor) {
        return apiResponse({
          status: RESPONSE_STATUS.BAD_REQUEST,
          message:
            "doctor with this license number or phone number already exists",
        });
      }
      const {
        permissions,
        name,
        status,
        password,
        availableDays,
        title,
        ...rest
      } = data;

      const user = await prisma.user.create({
        data: {
          password,
          title,
          name,
          loginId,
          status,
          username: loginId,
        },
      });

      await updatePermissions(permissions, user.id);

      const doctor = await prisma.doctor.create({
        data: { ...rest, userId: user.id },
      });

      const availability = await updateAvailability(availableDays, user.id);

      return apiResponse({
        status: RESPONSE_STATUS.CREATED,
        message: "Doctor Created Successfully",
        data: {
          ...doctor,
          availableDays: availability,
        },
      });
    },
  });
};

export const updateAPI = async (
  req: Request,
  { params }: { params: { userId: string } },
) => {
  return validateRequest({
    bodySchema: partialDoctorValidator,
    paramsSchema: partialDoctorValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      const existingUser = await prisma.user.findUnique({
        where: { id: data.userId },
        include: { doctor: true },
      });

      if (!existingUser || !existingUser.doctor) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Doctor not found",
        });
      }

      const { availableDays, name, password, permissions, status, ...rest } =
        data;

      const updatedUser = await prisma.user.update({
        where: { id: data.userId },
        data: { name, password, status },
      });

      const updatedDoctor = await prisma.doctor.update({
        where: { userId: existingUser.id },
        data: rest,
      });

      let updatedPermissions;
      if (permissions?.length) {
        updatedPermissions = await updatePermissions(permissions, data.userId);
      } else {
        updatedPermissions = await prisma.userPermission.findMany({
          where: { userId: data.userId },
          include: {
            permission: true,
          },
        });
      }

      let updatedAvailability;
      if (availableDays?.length) {
        updatedAvailability = await updateAvailability(
          availableDays,
          data.userId,
        );
      } else {
        updatedAvailability = await prisma.doctorAvailableDay.findMany({
          where: { doctorId: data.userId },
        });
      }

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Doctor Updated Successfully",
        data: {
          ...updatedDoctor,
          user: { ...updatedUser, permissions: updatedPermissions },
          availableDays: updatedAvailability,
        },
      });
    },
  });
};

export const deleteAPI = async (
  req: Request,
  { params }: { params: { userId: string } },
) => {
  return validateRequest({
    bodySchema: partialDoctorValidator,
    paramsSchema: partialDoctorValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      const existingUser = await prisma.user.findUnique({
        where: { id: data.userId },
        include: { doctor: true },
      });

      if (!existingUser || !existingUser.doctor) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Doctor not found",
        });
      }

      await prisma.user.delete({
        where: { id: data.userId },
      });

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Doctor Deleted Successfully",
        data: null,
      });
    },
  });
};
