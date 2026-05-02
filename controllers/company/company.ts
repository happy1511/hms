import { CompanyDetailsType } from "@/generated/prisma/enums";
import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { companyDetailsUpdateValidator } from "@/validators/api/company/company";

const COMPANY_DETAIL_TYPES = [
  CompanyDetailsType.HOSPITAL,
  CompanyDetailsType.LAB,
  CompanyDetailsType.PHARMACY,
] as const;

const ensureCompanyDetailsRows = async () => {
  const existingRows = await prisma.companyDetails.findMany({
    where: {
      type: {
        in: [...COMPANY_DETAIL_TYPES],
      },
    },
  });

  const existingTypes = new Set(existingRows.map((row) => row.type));
  const missingTypes = COMPANY_DETAIL_TYPES.filter((type) => !existingTypes.has(type));

  if (missingTypes.length) {
    await prisma.companyDetails.createMany({
      data: missingTypes.map((type) => ({
        type,
      })),
    });
  }

  const rows = missingTypes.length
    ? await prisma.companyDetails.findMany({
        where: {
          type: {
            in: [...COMPANY_DETAIL_TYPES],
          },
        },
      })
    : existingRows;

  return COMPANY_DETAIL_TYPES.reduce(
    (acc, type) => {
      const match = rows.find((row) => row.type === type);

      acc[type] = match ?? {
        id: 0,
        type,
        name: "",
        address: "",
        mobile: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return acc;
    },
    {} as Record<CompanyDetailsType, (typeof rows)[number]>,
  );
};

export const getCompanyDetailsAPI = async (req: Request) => {
  return validateRequest({
    req,
    onSuccess: async () => {
      const details = await ensureCompanyDetailsRows();

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
        where: { type: body.type },
        create: {
          type: body.type,
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
