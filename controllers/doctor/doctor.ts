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
import {
  Days,
  DoctorType,
  Prisma,
  ServiceApplicableOn,
  ServiceType,
  Status,
  User,
} from "@/generated/prisma/client";
import { buildUserName, trimOptionalString } from "@/lib/user";
import { upsertConsultingDoctorService } from "@/lib/systemBilling";

const softDeleteConsultingService = async (
  tx: Prisma.TransactionClient,
  {
    doctorId,
    actingUserId,
  }: {
    doctorId: number;
    actingUserId: number;
  },
) => {
  const existing = await tx.service.findFirst({
    where: { consultingDoctorId: doctorId, isDeleted: false },
    select: { id: true },
  });

  if (!existing) return;

  await tx.service.update({
    where: { id: existing.id },
    data: {
      isDeleted: true,
      deletedBy: actingUserId,
      updatedBy: actingUserId,
    },
  });
};

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
      and.push({ user: { isDeleted: false } });

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
          include: {
            user: true,
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

      const doctor = await prisma.doctor.findFirst({
        where: { userId: id, user: { isDeleted: false } },
        select: {
          user: {
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
              status: true,
              loginId: true,
              createdAt: true,
              updatedAt: true,
            },
          },
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
          consultationCharges: true,
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

export const createAPI = async (req: Request, actingUser: User) => {
  return validateRequest({
    bodySchema: doctorValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      const phoneBasedLoginId = data.contactNumber?.trim();
      let loginId = phoneBasedLoginId || "";

      if (phoneBasedLoginId) {
        const existingUserByLoginId = await prisma.user.findUnique({
          where: { loginId: phoneBasedLoginId },
        });

        if (existingUserByLoginId) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "User already exists for this phone number",
          });
        }
      } else {
        while (!loginId) {
          const id = generateUUID();

          const existingUser = await prisma.user.findUnique({
            where: { loginId: id },
          });

          if (existingUser) {
            continue;
          }
          loginId = id;
        }
      }

      const duplicateChecks: Prisma.DoctorWhereInput[] = [];
      if (data.licenseNumber?.trim()) {
        duplicateChecks.push({ licenseNumber: data.licenseNumber.trim() });
      }
      if (data.contactNumber?.trim()) {
        duplicateChecks.push({ phoneNumber: data.contactNumber.trim() });
      }
      if (data.email?.trim()) {
        duplicateChecks.push({ email: data.email.trim() });
      }

      if (duplicateChecks.length) {
        const existingDoctor = await prisma.doctor.findFirst({
          where: { OR: duplicateChecks },
        });

        if (existingDoctor) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message:
              "doctor with this license number, phone number or email already exists",
          });
        }
      }
      const { permissions, status, password, availableDays, title, ...rest } =
        data;
      const name = buildUserName(rest);

      const user = await prisma.user.create({
        data: {
          password:
            password ||
            `Ref@${String(loginId)
              .replace(/[^a-zA-Z0-9]/g, "")
              .slice(0, 8)}`,
          title,
          name,
          firstName: rest.firstName.trim(),
          middleName: trimOptionalString(rest.middleName),
          lastName: rest.lastName.trim(),
          preferredName: rest.preferredName.trim(),
          gender: rest.gender,
          dob: rest.dob,
          maritalStatus: rest.maritalStatus,
          address: trimOptionalString(rest.address),
          city: trimOptionalString(rest.city),
          country: trimOptionalString(rest.country),
          state: trimOptionalString(rest.state),
          postcode: trimOptionalString(rest.postcode),
          contactNumber: loginId,
          email: trimOptionalString(rest.email),
          identityType: rest.identityType,
          identityNumber: trimOptionalString(rest.identityNumber),
          education: trimOptionalString(rest.education),
          qualifications: trimOptionalString(rest.qualifications),
          department: trimOptionalString(rest.department),
          loginId,
          status: status ?? Status.active,
          username: loginId,
          createdBy: actingUser.id ,
          updatedBy: actingUser.id ,
        },
      });

      await updatePermissions(permissions || [], user.id);

      const doctorData = {
        licenseNumber: rest.licenseNumber?.trim() || null,
        specialization: rest.specialization?.trim() || null,
        qualifications: rest.qualifications?.trim() || null,
        department: rest.department?.trim() || null,
        yearsExperience: rest.yearsExperience ?? null,
        doctorType: rest.doctorType,
        consultationCharges:
          rest.consultationCharges !== undefined ? rest.consultationCharges : null,
        email: rest.email?.trim() || null,
        phoneNumber: rest.contactNumber?.trim() || null,
        designation: rest.designation?.trim() || null,
        consultationStartingTime: rest.consultationStartingTime?.trim() || null,
        consultationEndingTime: rest.consultationEndingTime?.trim() || null,
        emergencyContact: rest.emergencyContact?.trim() || null,
      };

      const doctor = await prisma.$transaction(async (tx) => {
        const createdDoctor = await tx.doctor.create({
          data: {
            ...doctorData,
            userId: user.id,
            createdBy: actingUser.id,
            updatedBy: actingUser.id,
          },
        });

        if (rest.doctorType === DoctorType["consulting"]) {
          await upsertConsultingDoctorService(tx, {
            doctorId: user.id,
            doctorName: name,
            consultationCharges: Number(rest.consultationCharges ?? 0),
            actingUserId: actingUser.id,
          });
        }

        return createdDoctor;
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
  actingUser: User,
) => {
  return validateRequest({
    bodySchema: partialDoctorValidator,
    paramsSchema: partialDoctorValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      const existingUser = await prisma.user.findFirst({
        where: { id: data.userId, isDeleted: false },
        include: { doctor: true },
      });

      if (!existingUser || !existingUser.doctor) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Doctor not found",
        });
      }

      const { availableDays, password, permissions, status, title, ...rest } =
        data;
      const nextContactNumber = rest.contactNumber?.trim();

      if (
        nextContactNumber &&
        nextContactNumber !== existingUser.contactNumber
      ) {
        const duplicateUser = await prisma.user.findFirst({
          where: {
            contactNumber: nextContactNumber,
            id: { not: data.userId },
          },
        });

        if (duplicateUser) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "User already exists for this phone number",
          });
        }
      }

      const nextEmail = rest.email?.trim();
      const nextLicenseNumber = rest.licenseNumber?.trim();
      const doctorDuplicateChecks: Prisma.DoctorWhereInput[] = [];

      if (
        nextLicenseNumber &&
        nextLicenseNumber !== existingUser.doctor.licenseNumber
      ) {
        doctorDuplicateChecks.push({
          licenseNumber: nextLicenseNumber,
          userId: { not: data.userId },
        });
      }

      if (
        nextContactNumber &&
        nextContactNumber !== existingUser.doctor.phoneNumber
      ) {
        doctorDuplicateChecks.push({
          phoneNumber: nextContactNumber,
          userId: { not: data.userId },
        });
      }

      if (nextEmail && nextEmail !== existingUser.doctor.email) {
        doctorDuplicateChecks.push({
          email: nextEmail,
          userId: { not: data.userId },
        });
      }

      if (doctorDuplicateChecks.length) {
        const existingDoctorDuplicate = await prisma.doctor.findFirst({
          where: { OR: doctorDuplicateChecks },
        });

        if (existingDoctorDuplicate) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message:
              "doctor with this license number, phone number or email already exists",
          });
        }
      }

      const nextName =
        rest.firstName || rest.middleName || rest.lastName
          ? buildUserName({
              firstName: rest.firstName ?? existingUser.firstName,
              middleName: rest.middleName ?? existingUser.middleName,
              lastName: rest.lastName ?? existingUser.lastName,
            })
          : existingUser.name;

      const effectiveDoctorType = rest.doctorType ?? existingUser.doctor.doctorType;
      const effectiveCharges =
        rest.consultationCharges ?? existingUser.doctor.consultationCharges;

      if (
        effectiveDoctorType === DoctorType["consulting"] &&
        (effectiveCharges === null || effectiveCharges === undefined)
      ) {
        return apiResponse({
          status: RESPONSE_STATUS.BAD_REQUEST,
          message: "Consultation charges are required for consulting doctors",
        });
      }

      const updatedUser = await prisma.user.update({
        where: { id: data.userId },
        data: {
          firstName: rest.firstName,
          middleName:
            rest.middleName !== undefined
              ? trimOptionalString(rest.middleName)
              : undefined,
          lastName: rest.lastName,
          preferredName: rest.preferredName,
          gender: rest.gender,
          dob: rest.dob,
          maritalStatus: rest.maritalStatus,
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
          contactNumber: nextContactNumber,
          email:
            rest.email !== undefined
              ? trimOptionalString(rest.email)
              : undefined,
          identityType: rest.identityType,
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
          name: nextName,
          password,
          status,
          title,
          loginId: nextContactNumber,
          username: nextContactNumber,
          updatedBy: actingUser.id ,
        },
      });

      const updatedDoctor = await prisma.doctor.update({
        where: { userId: existingUser.id },
        data: {
          licenseNumber:
            rest.licenseNumber !== undefined
              ? trimOptionalString(rest.licenseNumber)
              : undefined,
          specialization:
            rest.specialization !== undefined
              ? trimOptionalString(rest.specialization)
              : undefined,
          qualifications:
            rest.qualifications !== undefined
              ? trimOptionalString(rest.qualifications)
              : undefined,
          yearsExperience: rest.yearsExperience,
          department:
            rest.department !== undefined
              ? trimOptionalString(rest.department)
              : undefined,
          designation:
            rest.designation !== undefined
              ? trimOptionalString(rest.designation)
              : undefined,
          doctorType: rest.doctorType,
          consultationCharges:
            rest.consultationCharges !== undefined
              ? rest.consultationCharges
              : undefined,
          email:
            rest.email !== undefined
              ? trimOptionalString(rest.email)
              : undefined,
          phoneNumber: nextContactNumber,
          emergencyContact:
            rest.emergencyContact !== undefined
              ? trimOptionalString(rest.emergencyContact)
              : undefined,
          consultationStartingTime:
            rest.consultationStartingTime !== undefined
              ? trimOptionalString(rest.consultationStartingTime)
              : undefined,
          consultationEndingTime:
            rest.consultationEndingTime !== undefined
              ? trimOptionalString(rest.consultationEndingTime)
              : undefined,
          updatedBy: actingUser.id ,
        },
      });

      if (effectiveDoctorType === DoctorType["consulting"]) {
        await prisma.$transaction((tx) =>
          upsertConsultingDoctorService(tx, {
            doctorId: existingUser.id,
            doctorName: (nextName ?? existingUser.name ?? "").trim(),
            consultationCharges: Number(effectiveCharges),
            actingUserId: actingUser.id,
          }),
        );
      } else {
        await prisma.$transaction((tx) =>
          softDeleteConsultingService(tx, {
            doctorId: existingUser.id,
            actingUserId: actingUser.id,
          }),
        );
      }

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
  actingUser: User,
) => {
  return validateRequest({
    paramsSchema: partialDoctorValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      const data = params;
      const existingUser = await prisma.user.findFirst({
        where: { id: data.userId, isDeleted: false },
        include: { doctor: true },
      });

      if (!existingUser || !existingUser.doctor) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Doctor not found",
        });
      }

      await prisma.$transaction([
        prisma.doctor.update({
          where: { userId: data.userId },
          data: {
            deletedBy: actingUser.id ,
            updatedBy: actingUser.id ,
          },
        }),
        prisma.user.update({
          where: { id: data.userId },
          data: {
            isDeleted: true,
            deletedBy: actingUser.id ,
            updatedBy: actingUser.id ,
          },
        }),
        prisma.service.updateMany({
          where: { consultingDoctorId: data.userId, isDeleted: false },
          data: {
            isDeleted: true,
            deletedBy: actingUser.id,
            updatedBy: actingUser.id,
          },
        }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Doctor Deleted Successfully",
        data: null,
      });
    },
  });
};

