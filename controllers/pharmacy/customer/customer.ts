import { Prisma, User } from "@/generated/prisma/client";
import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { paginationValidator } from "@/validators/api/common/pagination";
import {
  partialPharmacyCustomerValidator,
  pharmacyCustomerValidator,
} from "@/validators/api/masters/pharmacyCustomer";

export const getAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const search = query.search ?? "";
      const skip = (page - 1) * limit;

      const and: Prisma.PharmacyCustomerWhereInput[] = [{ isDeleted: false }];

      if (search) {
        and.push({
          OR: [
            { name: { contains: search } },
            { contact: { contains: search } },
            { gstNumber: { contains: search } },
            { dlNumber: { contains: search } },
            { patient: { firstName: { contains: search } } },
            { patient: { lastName: { contains: search } } },
          ],
        });
      }

      const where: Prisma.PharmacyCustomerWhereInput = { AND: and };

      const [items, total] = await prisma.$transaction([
        prisma.pharmacyCustomer.findMany({
          skip,
          take: limit,
          where,
          orderBy: { id: "desc" },
          include: {
            patient: true,
          },
        }),
        prisma.pharmacyCustomer.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Pharmacy customers fetched successfully",
        data: items,
        total,
      });
    },
  });
};

export const createAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: pharmacyCustomerValidator,
    req,
    user,
    onSuccess: async ({ body, user }) => {
      if (body.patientId) {
        const patient = await prisma.patient.findUnique({
          where: { id: body.patientId },
          select: { id: true },
        });

        if (!patient) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Selected patient not found",
          });
        }
      }

      const customer = await prisma.pharmacyCustomer.create({
        data: {
          name: body.name,
          address: body.address || null,
          contact: body.contact || null,
          isBusinessCustomer: body.isBusinessCustomer,
          dlNumber: body.dlNumber || null,
          gstNumber: body.gstNumber || null,
          patientId: body.patientId,
          createdBy: user.id,
          updatedBy: user.id,
        },
        include: {
          patient: true,
        },
      });

      return apiResponse({
        status: RESPONSE_STATUS.CREATED,
        message: "Pharmacy customer created successfully",
        data: customer,
      });
    },
  });
};

export const getDetailsAPI = async (
  req: Request,
  { params }: { params: { customerId: string } },
) => {
  return validateRequest({
    paramsSchema: partialPharmacyCustomerValidator,
    params: { customerId: Number(params.customerId) },
    req,
    onSuccess: async ({ params }) => {
      const customer = await prisma.pharmacyCustomer.findFirst({
        where: {
          id: params.customerId,
          isDeleted: false,
        },
        include: {
          patient: true,
        },
      });

      if (!customer) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Pharmacy customer not found",
        });
      }

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Pharmacy customer fetched successfully",
        data: customer,
      });
    },
  });
};
