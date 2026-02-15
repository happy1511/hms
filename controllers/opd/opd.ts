import { Prisma } from "@/generated/prisma/client";
import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { paginationValidator } from "@/validators/api/common/pagination";
import { opdValidator } from "@/validators/api/opd/opd";

export const getAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const createdAtFrom = query["createdAt[from]"] ?? "";
      const createdAtTo = query["createdAt[to]"] ?? "";
      const consultantDoctorId = query.consultantDoctorId
        ? Number(query.consultantDoctorId)
        : null;
      const referringDoctorId = query.referringDoctorId
        ? Number(query.referringDoctorId)
        : null;

      const skip = (page - 1) * limit;
      const and: Prisma.OpdWhereInput[] = [];

      if (consultantDoctorId) {
        and.push({ consultantDoctorId });
      }
      if (referringDoctorId) {
        and.push({ referringDoctorId });
      }

      if (createdAtFrom || createdAtTo) {
        and.push({
          createdAt: {
            ...(createdAtFrom && { gte: createdAtFrom }),
            ...(createdAtTo && { lte: createdAtTo }),
          },
        });
      }

      const where: Prisma.OpdWhereInput = and.length ? { AND: and } : {};

      const [items, total] = await prisma.$transaction([
        prisma.opd.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
          select: {
            id: true,
            arrivalState: true,
            total: true,
            discountType: true,
            discountValue: true,
            rate: true,
            transactions: true,
            consultantDoctor: {
              select: {
                user: {
                  omit: {
                    password: true,
                  },
                },
              },
            },
            referringDoctor: {
              select: {
                user: {
                  omit: {
                    password: true,
                  },
                },
              },
            },
            patient: {
              select: {
                uhid: true,
                lastName: true,
                firstName: true,
                middleName: true,
                dob: true,
                maritalStatus: true,
                relations: true,
                addresses: true,
                contacts: true,
              },
            },
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.opd.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Opds Fetched Successfully",
        data: items,
        total,
      });
    },
  });
};

export const createAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: opdValidator,
    req,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const existingPatient = await tx.patient.findFirst({
          where: { id: body.patientId },
        });

        if (!existingPatient) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Patient Not Found",
          });
        }

        const createdOpd = await tx.opd.create({
          data: {
            patientId: body.patientId,
            arrivalState: body.arrivalState,
            remarks: body.remarks,
            rate: body.rate,
            discountType: body.discountType,
            discountValue: body.discountValue,
            total: body.total,
            isPaid: body.isPaid,
            isFree: body.isFree,
            consultantDoctorId: body.consultantDoctorId,
            referringDoctorId: body.referredDoctorId,
            billingType: body.billingType,
            createdAt: body.createdAt,
            opdBillingItems: {
              create:
                body.billingItem?.map((item) => ({
                  billingSectionId: item.billingSectionId,
                  serviceId: item.serviceId,
                  quantity: item.quantity,
                  rate: item.rate,
                  discountType: item.discountType,
                  discountValue: item.discountValue,
                  total: item.total,
                  createdAt: item.createdAt,
                })) || [],
            },

            transactions: {
              create: body.transactions?.map((transaction) => ({
                amount: transaction.amount,
                mode: transaction.mode,
                remarks: transaction.remarks,
              })),
            },
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "OPD Created Successfully",
          data: createdOpd,
        });
      });
    },
  });
};
