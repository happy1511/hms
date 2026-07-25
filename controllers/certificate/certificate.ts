import { User } from "@/generated/prisma/client";
import { CertificateType } from "@/generated/prisma/enums";
import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { paginationValidator } from "@/validators/api/common/pagination";
import {
  certificateTemplateValidator,
  opdCertificateValidator,
} from "@/validators/api/masters/certificate";
import z from "zod";

const certificateListQueryValidator = paginationValidator.extend({
  type: z.enum(CertificateType).optional(),
});

const certificateIdParamsValidator = z.object({
  certificateId: z.coerce.number().int().positive(),
});

const certificateSelect = {
  id: true,
  type: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  opd: {
    select: {
      id: true,
      opdDateTime: true,
      consultantDoctor: {
        select: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
      patient: {
        select: {
          id: true,
          uhid: true,
          title: true,
          firstName: true,
          middleName: true,
          lastName: true,
          gender: true,
          dob: true,
        },
      },
    },
  },
} as const;

export const getCertificateTemplatesAPI = async (req: Request) => {
  return validateRequest({
    req,
    onSuccess: async () => {
      const templates = await prisma.certificateTemplate.findMany({
        select: {
          type: true,
          content: true,
        },
      });

      const templateMap = {
        [CertificateType.MEDICAL]:
          templates.find((item) => item.type === CertificateType.MEDICAL)
            ?.content || "",
        [CertificateType.FITNESS]:
          templates.find((item) => item.type === CertificateType.FITNESS)
            ?.content || "",
      };

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Certificate templates fetched successfully",
        data: templateMap,
      });
    },
  });
};

export const saveCertificateTemplateAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: certificateTemplateValidator,
    req,
    onSuccess: async ({ body }) => {
      const saved = await prisma.certificateTemplate.upsert({
        where: { type: body.type },
        create: {
          type: body.type,
          content: body.content,
          createdBy: user.id,
          updatedBy: user.id,
        },
        update: {
          content: body.content,
          updatedBy: user.id,
        },
      });

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Certificate template saved successfully",
        data: saved,
      });
    },
  });
};

export const getCertificatesAPI = async (req: Request) => {
  return validateRequest({
    querySchema: certificateListQueryValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const opdId = query.opdId ? Number(query.opdId) : undefined;
      const type = query.type;
      const skip = (page - 1) * limit;

      const where = {
        ...(opdId ? { opdId } : {}),
        ...(type ? { type } : {}),
      };

      const [items, total] = await prisma.$transaction([
        prisma.opdCertificate.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: certificateSelect,
        }),
        prisma.opdCertificate.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Certificates fetched successfully",
        data: items,
        total,
      });
    },
  });
};

export const createCertificateAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: opdCertificateValidator,
    req,
    onSuccess: async ({ body }) => {
      const opd = await prisma.opd.findFirst({
        where: { id: body.opdId, isDeleted: false },
        select: { id: true },
      });

      if (!opd) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "OPD not found",
        });
      }

      const created = await prisma.opdCertificate.create({
        data: {
          opdId: body.opdId,
          type: body.type,
          content: body.content,
          createdBy: user.id,
          updatedBy: user.id,
        },
        select: certificateSelect,
      });

      return apiResponse({
        status: RESPONSE_STATUS.CREATED,
        message: "Certificate created successfully",
        data: created,
      });
    },
  });
};

export const getCertificateByIdAPI = async (
  req: Request,
  { params }: { params: { certificateId: string } },
) => {
  return validateRequest({
    paramsSchema: certificateIdParamsValidator,
    req,
    params,
    onSuccess: async ({ params: parsedParams }) => {
      const certificate = await prisma.opdCertificate.findUnique({
        where: { id: parsedParams.certificateId },
        select: certificateSelect,
      });

      if (!certificate) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Certificate not found",
        });
      }

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Certificate fetched successfully",
        data: certificate,
      });
    },
  });
};
