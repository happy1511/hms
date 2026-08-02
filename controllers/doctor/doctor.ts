import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { apiResponse } from "@/lib/apiResponse";
import {
  doctorValidator,
  DoctorValidatorType,
  partialDoctorValidator,
} from "@/validators/api/masters/doctor";
import { paginationValidator } from "@/validators/api/common/pagination";
import {
  Days,
  DoctorType,
  Prisma,
  Status,
  User,
} from "@/generated/prisma/client";
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
  doctorId: number,
) => {
  const availabilityPairs = availableDays?.filter((p) => p.available);

  await prisma.$transaction(async (tx) => {
    await tx.doctorAvailableDay.deleteMany({
      where: { doctorId },
    });

    if (availabilityPairs?.length) {
      await tx.doctorAvailableDay.createMany({
        data: availabilityPairs.map((p) => ({
          doctorId,
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
        and.push({
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { middleName: { contains: search } },
          ],
        });
      }
      and.push({ isDeleted: false });

      if (status) {
        and.push({ status: { equals: status as Status } });
      }

      if (doctorType) {
        and.push({ doctorType: { equals: doctorType as DoctorType } });
      }

      if (createdAtFrom || createdAtTo) {
        and.push({
          createdAt: {
            ...(createdAtFrom && { gte: new Date(createdAtFrom) }),
            ...(createdAtTo && { lte: new Date(createdAtTo) }),
          },
        });
      }

      const where: Prisma.DoctorWhereInput = and.length ? { AND: and } : {};

      const [items, total] = await prisma.$transaction([
        prisma.doctor.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
          include: {
            availableDays: true,
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
  { params }: { params: { userId?: string; doctorId?: string } },
) => {
  return validateRequest({
    paramsSchema: partialDoctorValidator,
    req,
    params,
    onSuccess: async ({ params }) => {
      const id = Number(params.doctorId || params.userId);

      const doctor = await prisma.doctor.findFirst({
        where: { id, isDeleted: false },
        include: {
          availableDays: true,
        },
      });

      if (!doctor) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Doctor not found",
        });
      }

      const availabilityResult = Object.values(Days).map((d) => ({
        day: d,
        available:
          doctor.availableDays.findIndex((day) => day.day === d) !== -1,
      }));

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Doctor Fetched Successfully",
        data: {
          ...doctor,
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

      const duplicateChecks: Prisma.DoctorWhereInput[] = [];
      if (data.licenseNumber?.trim()) {
        duplicateChecks.push({ licenseNumber: data.licenseNumber.trim() });
      }
      if (data.phoneNumber?.trim() || data.contactNumber?.trim()) {
        const phone = (data.phoneNumber || data.contactNumber)?.trim();
        if (phone) duplicateChecks.push({ phoneNumber: phone });
      }
      if (data.email?.trim()) {
        duplicateChecks.push({ email: data.email.trim() });
      }

      if (duplicateChecks.length) {
        const existingDoctor = await prisma.doctor.findFirst({
          where: { OR: duplicateChecks, isDeleted: false },
        });

        if (existingDoctor) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message:
              "Doctor with this license number, phone number or email already exists",
          });
        }
      }

      const { availableDays, contactNumber, phoneNumber, ...rest } = data;
      const phone = (phoneNumber || contactNumber)?.trim() || null;
      const doctorName = [rest.title, rest.firstName, rest.lastName]
        .filter(Boolean)
        .join(" ");

      const doctor = await prisma.$transaction(async (tx) => {
        const createdDoctor = await tx.doctor.create({
          data: {
            title: rest.title || null,
            firstName: rest.firstName.trim(),
            middleName: rest.middleName?.trim() || null,
            lastName: rest.lastName?.trim() || null,
            gender: rest.gender || null,
            userType: rest.userType || "Doctor",
            doctorType: rest.doctorType,
            licenseNumber: rest.licenseNumber?.trim() || null,
            specialization: rest.specialization?.trim() || null,
            qualifications: rest.qualifications?.trim() || null,
            department: rest.department?.trim() || null,
            yearsExperience: rest.yearsExperience ?? null,
            designation: rest.designation?.trim() || null,
            consultationCharges:
              rest.consultationCharges !== undefined
                ? rest.consultationCharges
                : null,
            email: rest.email?.trim() || null,
            phoneNumber: phone,
            emergencyContact: rest.emergencyContact?.trim() || null,
            consultationStartingTime: rest.consultationStartingTime?.trim() || null,
            consultationEndingTime: rest.consultationEndingTime?.trim() || null,
            status: rest.status ?? Status.active,
            createdBy: actingUser.id,
            updatedBy: actingUser.id,
          },
        });

        if (rest.doctorType === DoctorType.consulting) {
          await upsertConsultingDoctorService(tx, {
            doctorId: createdDoctor.id,
            doctorName,
            consultationCharges: Number(rest.consultationCharges ?? 0),
            actingUserId: actingUser.id,
          });
        }

        return createdDoctor;
      });

      if (availableDays?.length) {
        await updateAvailability(availableDays, doctor.id);
      }

      return apiResponse({
        status: RESPONSE_STATUS.CREATED,
        message: "Doctor Created Successfully",
        data: doctor,
      });
    },
  });
};

export const updateAPI = async (
  req: Request,
  { params }: { params: { userId?: string; doctorId?: string } },
  actingUser: User,
) => {
  return validateRequest({
    bodySchema: partialDoctorValidator,
    paramsSchema: partialDoctorValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      const id = Number(data.doctorId || data.userId || params.doctorId || params.userId);

      const existingDoctor = await prisma.doctor.findFirst({
        where: { id, isDeleted: false },
      });

      if (!existingDoctor) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Doctor not found",
        });
      }

      const { availableDays, contactNumber, phoneNumber, ...rest } = data;
      const phone = (phoneNumber || contactNumber)?.trim() || existingDoctor.phoneNumber;
      const doctorName = [
        rest.title ?? existingDoctor.title,
        rest.firstName ?? existingDoctor.firstName,
        rest.lastName ?? existingDoctor.lastName,
      ]
        .filter(Boolean)
        .join(" ");

      const effectiveDoctorType = rest.doctorType ?? existingDoctor.doctorType;
      const effectiveCharges =
        rest.consultationCharges ?? existingDoctor.consultationCharges;

      const updatedDoctor = await prisma.doctor.update({
        where: { id },
        data: {
          title: rest.title,
          firstName: rest.firstName,
          middleName: rest.middleName,
          lastName: rest.lastName,
          gender: rest.gender,
          userType: rest.userType,
          doctorType: rest.doctorType,
          licenseNumber: rest.licenseNumber,
          specialization: rest.specialization,
          qualifications: rest.qualifications,
          yearsExperience: rest.yearsExperience,
          department: rest.department,
          designation: rest.designation,
          consultationCharges: rest.consultationCharges,
          email: rest.email,
          phoneNumber: phone,
          emergencyContact: rest.emergencyContact,
          consultationStartingTime: rest.consultationStartingTime,
          consultationEndingTime: rest.consultationEndingTime,
          status: rest.status,
          updatedBy: actingUser.id,
        },
      });

      if (effectiveDoctorType === DoctorType.consulting) {
        await prisma.$transaction((tx) =>
          upsertConsultingDoctorService(tx, {
            doctorId: id,
            doctorName,
            consultationCharges: Number(effectiveCharges ?? 0),
            actingUserId: actingUser.id,
          }),
        );
      } else {
        await prisma.$transaction((tx) =>
          softDeleteConsultingService(tx, {
            doctorId: id,
            actingUserId: actingUser.id,
          }),
        );
      }

      if (availableDays?.length) {
        await updateAvailability(availableDays, id);
      }

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Doctor Updated Successfully",
        data: updatedDoctor,
      });
    },
  });
};

export const deleteAPI = async (
  req: Request,
  { params }: { params: { userId?: string; doctorId?: string } },
  actingUser: User,
) => {
  return validateRequest({
    paramsSchema: partialDoctorValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      const id = Number(params.doctorId || params.userId);
      const existingDoctor = await prisma.doctor.findFirst({
        where: { id, isDeleted: false },
      });

      if (!existingDoctor) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Doctor not found",
        });
      }

      await prisma.$transaction([
        prisma.doctor.update({
          where: { id },
          data: {
            isDeleted: true,
            deletedBy: actingUser.id,
            updatedBy: actingUser.id,
          },
        }),
        prisma.service.updateMany({
          where: { consultingDoctorId: id, isDeleted: false },
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
