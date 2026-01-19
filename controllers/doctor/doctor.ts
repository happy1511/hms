import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { apiResponse } from "@/lib/apiResponse";
import {
  doctorValidator,
  partialDoctorValidator,
} from "@/validators/api/masters/doctor";

export const createAPI = async (req: Request) => {
  return validateRequest(doctorValidator, req, async (data) => {
    const existingUser = await prisma.user.findUnique({
      where: { loginId: data.loginId },
    });

    if (existingUser) {
      return apiResponse({
        status: RESPONSE_STATUS.BAD_REQUEST,
        message: "This Login Id is not available",
      });
    }

    const existingDoctor = await prisma.doctor.findFirst({
      where: {
        licenseNumber: data.licenseNumber,
      },
    });

    if (existingDoctor) {
      return apiResponse({
        status: RESPONSE_STATUS.BAD_REQUEST,
        message: "This license number is already attached to another doctor",
      });
    }

    const role = await prisma.role.upsert({
      where: { name: "doctor" },
      update: {},
      create: {
        name: "doctor",
      },
    });

    const user = await prisma.user.create({
      data: {
        loginId: data.loginId,
        password: data.password,
        username: data.name,
        roleId: role.id,
      },
    });

    const { availableDays, ...rest } = data;

    const doctor = await prisma.doctor.create({
      data: { ...rest, userId: user.id },
    });

    let availability;
    if (availableDays?.length) {
      availability = await prisma.doctorAvailableDay.createMany({
        data: availableDays.map((d) => ({
          doctorId: doctor.userId,
          day: d,
        })),
      });
    }

    return apiResponse({
      status: RESPONSE_STATUS.CREATED,
      message: "Doctor Created Successfully",
      data: {
        ...doctor,
        availableDays: availability,
      },
    });
  });
};

export const updateAPI = async (req: Request) => {
  return validateRequest(partialDoctorValidator, req, async (data) => {
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

    const { availableDays, ...rest } = data;
    const updatedDoctor = await prisma.doctor.update({
      where: { userId: existingUser.id },
      data: rest,
    });

    if (availableDays && Array.isArray(availableDays)) {
      await prisma.doctorAvailableDay.deleteMany({
        where: { doctorId: updatedDoctor.userId },
      });

      if (availableDays.length) {
        await prisma.doctorAvailableDay.createMany({
          data: availableDays.map((d) => ({
            doctorId: updatedDoctor.userId,
            day: d,
          })),
        });
      }
    }

    return apiResponse({
      status: RESPONSE_STATUS.SUCCESS,
      message: "Doctor Updated Successfully",
      data: {
        ...updatedDoctor,
      },
    });
  });
};

export const deleteAPI = async (req: Request) => {
  return validateRequest(partialDoctorValidator, req, async (data) => {
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
  });
};
