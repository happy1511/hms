import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { companyDetailsUpdateValidator } from "@/validators/api/company/company";

const COMPANY_DETAILS_ID = 1;

export const getCompanyDetailsAPI = async (req: Request) => {
  return validateRequest({
    req,
    onSuccess: async () => {
      let details = await prisma.companyDetails.findUnique({
        where: { id: COMPANY_DETAILS_ID },
      });

      if (!details) {
        details = await prisma.companyDetails.create({
          data: { id: COMPANY_DETAILS_ID },
        });
      }

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Company details fetched successfully",
        data: details,
      });
    },
  });
};

export const updateCompanyDetailsAPI = async (req: Request) => {
  return validateRequest({
    req,
    bodySchema: companyDetailsUpdateValidator,
    onSuccess: async ({ body }) => {
      const details = await prisma.companyDetails.upsert({
        where: { id: COMPANY_DETAILS_ID },
        create: {
          id: COMPANY_DETAILS_ID,
          name: body.name,
          address: body.address ?? "",
          mobile: body.mobile ?? "",
        },
        update: {
          name: body.name,
          address: body.address ?? "",
          mobile: body.mobile ?? "",
        },
      });

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Company details updated successfully",
        data: details,
      });
    },
  });
};

