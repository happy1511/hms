import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { apiResponse } from "@/lib/apiResponse";
import { paginationValidator } from "@/validators/api/common/pagination";
import { AppointmentStatus, Prisma } from "@/generated/prisma/client";
import {
  appointmentValidator,
  partialAppointmentValidator,
} from "@/validators/api/appointment/appointment";

export const getAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const search = query.search ?? "";
      const status = query.appointmentStatus ?? "";
      const doctorId = query.doctorId ? Number(query.doctorId) : null;
      const createdAtFrom = query["createdAt[from]"] ?? "";
      const createdAtTo = query["createdAt[to]"] ?? "";

      const skip = (page - 1) * limit;
      const and: Prisma.AppointmentWhereInput[] = [];

      if (search) {
        and.push({
          patient: {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { middleName: { contains: search } },
            ],
          },
        });
      }

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

      if (doctorId) {
        and.push({ doctorId: { equals: doctorId } });
      }

      const where: Prisma.AppointmentWhereInput = and.length
        ? { AND: and }
        : {};

      const [items, total] = await prisma.$transaction([
        prisma.appointment.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
          select: {
            id: true,
            doctor: { select: { user: { select: { name: true } } } },
            patient: true,
            status: true,
            appointmentDate: true,
            remarks: true,
            type: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.appointment.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Appointment Fetched Successfully",
        data: items,
        total,
      });
    },
  });
};

export const createAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: appointmentValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const existingPatient = await tx.patient.findFirst({
          where: { id: data.patientId },
        });

        if (!existingPatient) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Patient not found",
          });
        }
        const existingAppointment = await tx.appointment.findFirst({
          where: {
            patientId: data.patientId,
            doctorId: data.doctorId,
            appointmentDate: data.appointmentDate,
            status: AppointmentStatus.SCHEDULED,
          },
        });

        if (existingAppointment) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Appointment already exists for the given date and doctor",
          });
        }

        const existingDoctor = await tx.doctor.findUnique({
          where: { userId: data.doctorId },
        });

        if (!existingDoctor) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Doctor not found",
          });
        }

        const appointment = await tx.appointment.create({
          data: {
            ...data,
            patientId: existingPatient.id,
            doctorId: existingDoctor.userId,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Appointment Created Successfully",
          data: appointment,
        });
      });
    },
  });
};

export const updateAPI = async (
  req: Request,
  { params }: { params: { appointmentId: number } },
) => {
  return validateRequest({
    bodySchema: partialAppointmentValidator,
    paramsSchema: partialAppointmentValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const existingAppointment = await tx.appointment.findUnique({
          where: { id: data.appointmentId },
        });

        if (!existingAppointment) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Appointment not found",
          });
        }

        const updatedAppointment = await tx.appointment.update({
          where: { id: data.appointmentId },
          data: {
            ...data,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Appointment Updated Successfully",
          data: updatedAppointment,
        });
      });
    },
  });
};
