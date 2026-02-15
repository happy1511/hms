import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { opdValidator } from "@/validators/api/opd/opd";

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
