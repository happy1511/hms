import {
  DocumentStoreType,
  Prisma,
  RadiologyOrderStatus,
  ServiceApplicableOn,
  ServiceType,
  User,
} from "@/generated/prisma/client";
import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import {
  deletePublicDocument,
  savePublicDocument,
} from "@/services/documentStore";
import { prisma } from "@/services/prisma";
import { paginationValidator } from "@/validators/api/common/pagination";
import {
  partialRadiologyTemplateValidator,
  partialRadiologyTestOrder,
  partialRadiologyTestValidator,
  radiologyTemplateValidator,
  radiologyTestValidator,
} from "@/validators/api/masters/radiologyTest";

export const getAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const search = query.search ?? "";
      const status = query.status ?? "";
      const createdAtFrom = query["createdAt[from]"] ?? "";
      const createdAtTo = query["createdAt[to]"] ?? "";
      const sectionType = query.radiologyTestType ?? "";

      const skip = (page - 1) * limit;
      const and: Prisma.RadiologyTestWhereInput[] = [];

      if (search) {
        and.push({ name: { contains: search } });
      }
      and.push({ isDeleted: false });

      if (status) {
        and.push({ status: { equals: status } });
      }

      if (sectionType) {
        and.push({
          section: { equals: sectionType },
        });
      }

      if (createdAtFrom || createdAtTo) {
        and.push({
          createdAt: {
            ...(createdAtFrom && { gte: createdAtFrom }),
            ...(createdAtTo && { lte: createdAtTo }),
          },
        });
      }

      const where: Prisma.RadiologyTestWhereInput = and.length
        ? { AND: and }
        : {};

      const [items, total] = await prisma.$transaction([
        prisma.radiologyTest.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
          select: {
            id: true,
            name: true,
            alias: true,
            price: true,
            section: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            radiologyTestServices: {
              select: {
                service: {
                  select: {
                    id: true,
                    billingSectionId: true,
                    billingSection: {
                      select: { id: true, name: true },
                    },
                  },
                },
              },
            },
          },
        }),
        prisma.radiologyTest.count({ where }),
      ]);

      const formattedItems = items.map((item) => {
        const service = item.radiologyTestServices?.[0]?.service;
        return {
          ...item,
          billingSectionId: service?.billingSectionId || null,
          billingSection: service?.billingSection || null,
        };
      });

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Radiology Tests Fetched Successfully",
        data: formattedItems,
        total,
      });
    },
  });
};

export const createAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: radiologyTestValidator,
    req,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const existingTest = await tx.radiologyTest.findFirst({
          where: { name: body.name, isDeleted: false },
        });

        if (existingTest) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Test with this name already exists",
          });
        }

        const createdTest = await tx.radiologyTest.create({
          data: {
            name: body.name,
            alias: body.alias,
            price: body.price,
            status: body.status,
            section: body.section,
            createdBy: user.id,
            updatedBy: user.id,
          },
        });

        await tx.service.create({
          data: {
            name: body.name,
            type: ServiceType["RADIOLOGY_TEST"],
            price: body.price,
            billingSectionId: body.billingSectionId,
            applicableOn: ServiceApplicableOn["BOTH"],
            status: body.status,
            createdBy: user.id,
            updatedBy: user.id,
            radiologyTests: {
              create: {
                testId: createdTest.id,
              },
            },
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Radiology Test Created Successfully",
          data: createdTest,
        });
      });
    },
  });
};

export const deleteAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: partialRadiologyTestValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      return prisma.$transaction(async (tx) => {
        const existingTest = await tx.radiologyTest.findFirst({
          where: { id: data.testId, isDeleted: false },
        });

        if (!existingTest) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Radiology Test not found",
          });
        }

        await tx.radiologyTest.update({
          where: { id: data.testId },
          data: {
            isDeleted: true,
            deletedBy: user.id,
            updatedBy: user.id,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Radiology Test Deleted Successfully",
          data: null,
        });
      });
    },
  });
};

export const updateAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: partialRadiologyTestValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      return prisma.$transaction(async (tx) => {
        const existingTest = await tx.radiologyTest.findFirst({
          where: { id: data.testId, isDeleted: false },
        });

        if (!existingTest) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Radiology Test not found",
          });
        }

        const updatedTest = await tx.radiologyTest.update({
          where: { id: data.testId },
          data: {
            ...(data.name && { name: data.name }),
            ...(data.alias && { alias: data.alias }),
            ...(data.price !== undefined && { price: data.price }),
            ...(data.status && { status: data.status }),
            ...(data.section && { section: data.section }),
            updatedBy: user.id,
          },
        });

        const testService = await tx.radiologyTestService.findFirst({
          where: { testId: data.testId },
        });

        if (testService) {
          await tx.service.update({
            where: { id: testService.serviceId },
            data: {
              ...(data.name && { name: data.name }),
              ...(data.price !== undefined && { price: data.price }),
              ...(data.status && { status: data.status }),
              ...(data.billingSectionId && {
                billingSectionId: data.billingSectionId,
              }),
              updatedBy: user.id,
            },
          });
        }

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Radiology Test Updated Successfully",
          data: updatedTest,
        });
      });
    },
  });
};

export const getTemplatesAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const search = query.search ?? "";
      const status = query.status ?? "";
      const createdAtFrom = query["createdAt[from]"] ?? "";
      const createdAtTo = query["createdAt[to]"] ?? "";
      const sectionType = query.radiologyTestType ?? "";

      const skip = (page - 1) * limit;
      const and: Prisma.RadiologyTemplateWhereInput[] = [];

      if (search) {
        and.push({ name: { contains: search } });
      }
      and.push({ isDeleted: false });

      if (status) {
        and.push({ status: { equals: status } });
      }

      if (sectionType) {
        and.push({
          section: { equals: sectionType },
        });
      }

      if (createdAtFrom || createdAtTo) {
        and.push({
          createdAt: {
            ...(createdAtFrom && { gte: createdAtFrom }),
            ...(createdAtTo && { lte: createdAtTo }),
          },
        });
      }

      const where: Prisma.RadiologyTemplateWhereInput = and.length
        ? { AND: and }
        : {};

      const [items, total] = await prisma.$transaction([
        prisma.radiologyTemplate.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
          select: {
            id: true,
            name: true,
            section: true,
            content: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.radiologyTemplate.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Radiology Templates Fetched Successfully",
        data: items,
        total,
      });
    },
  });
};

export const getTemplateDetailsAPI = async (
  req: Request,
  { params }: { params: { templateId: number } },
) => {
  return validateRequest({
    paramsSchema: partialRadiologyTemplateValidator,
    req,
    params,
    onSuccess: async ({ params }) => {
      return prisma.$transaction(async (tx) => {
        const existingTemplate = await tx.radiologyTemplate.findFirst({
          where: { id: params.templateId, isDeleted: false },
          include: { radiologyTests: true, radiologyTestResults: true },
        });

        if (!existingTemplate) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Radiology Template not found",
          });
        }

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Radiology Template Fetched Successfully",
          data: existingTemplate,
        });
      });
    },
  });
};

export const createTemplateAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: radiologyTemplateValidator,
    req,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const existingTemplate = await tx.radiologyTemplate.findFirst({
          where: { name: body.name, isDeleted: false },
        });

        if (existingTemplate) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Template with this name already exists",
          });
        }

        if (body.radiologyTests?.length) {
          const tests = await tx.radiologyTest.findMany({
            where: {
              id: { in: body.radiologyTests.map((i) => i.id) },
              isDeleted: false,
            },
            select: { id: true },
          });

          if (tests.length !== body.radiologyTests.length) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "One or more radiology tests are invalid",
            });
          }
        }

        const createdTemplate = await tx.radiologyTemplate.create({
          data: {
            name: body.name,
            section: body.section,
            status: body.status,
            content: body.content,
            createdBy: user.id,
            updatedBy: user.id,
            radiologyTests: {
              connect: (body.radiologyTests?.map((i) => i.id) ?? []).map(
                (id) => ({ id }),
              ),
            },
          },
          include: {
            radiologyTests: true,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Radiology Template Created Successfully",
          data: createdTemplate,
        });
      });
    },
  });
};

export const deleteTemplateAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: partialRadiologyTemplateValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      return prisma.$transaction(async (tx) => {
        const existingTest = await tx.radiologyTemplate.findFirst({
          where: { id: data.templateId, isDeleted: false },
        });

        if (!existingTest) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Radiology Template not found",
          });
        }

        await tx.radiologyTemplate.update({
          where: { id: data.templateId },
          data: {
            isDeleted: true,
            deletedBy: user.id,
            updatedBy: user.id,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Radiology Template Deleted Successfully",
          data: null,
        });
      });
    },
  });
};

export const updateTemplateAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: partialRadiologyTemplateValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const existingTemplate = await tx.radiologyTemplate.findFirst({
          where: { id: data.templateId, isDeleted: false },
          include: { radiologyTests: { select: { id: true } } },
        });

        if (!existingTemplate) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Radiology Template not found",
          });
        }

        // optional: check duplicate name (excluding self)
        const duplicate = await tx.radiologyTemplate.findFirst({
          where: {
            name: data.name,
            id: { not: data.templateId },
            isDeleted: false,
          },
        });

        if (duplicate) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Template with this name already exists",
          });
        }

        // validate radiology tests
        if (data.radiologyTests?.length) {
          const tests = await tx.radiologyTest.findMany({
            where: {
              id: { in: data.radiologyTests.map((i) => i.id) },
              isDeleted: false,
            },
            select: { id: true },
          });

          if (tests.length !== data.radiologyTests.length) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "One or more radiology tests are invalid",
            });
          }
        }

        const updatedTemplate = await tx.radiologyTemplate.update({
          where: { id: data.templateId },
          data: {
            name: data.name,
            section: data.section,
            status: data.status,
            content: data.content,
            updatedBy: user.id,

            // 🔑 this replaces previous relations completely
            radiologyTests: {
              set: (data.radiologyTests?.map((i) => i.id) ?? []).map((id) => ({
                id,
              })),
            },
          },
          include: {
            radiologyTests: true,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Radiology Template Updated Successfully",
          data: updatedTemplate,
        });
      });
    },
  });
};

export const getOrdersAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const { searchParams } = new URL(req.url);
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);

      const rawStatuses =
        searchParams.getAll("radiologyOrderStatus").length > 0
          ? searchParams.getAll("radiologyOrderStatus")
          : searchParams.getAll("radiologyOrderStatus[]").length > 0
            ? searchParams.getAll("radiologyOrderStatus[]")
            : (query.radiologyOrderStatus ?? "");

      const statuses = rawStatuses;
      const requestedStatuses = Array.isArray(statuses) ? statuses : statuses ? [statuses] : [];
      const name = query.search ?? "";
      const createdAtFrom = query["createdAt[from]"] ?? "";
      const createdAtTo = query["createdAt[to]"] ?? "";
      // const defaultSelectedIds = query.defaultSelectedIds;
      const cancelled = query.cancelled;
      const outsourced = query.outsourced;
      const opdId = query.opdId;
      const shouldExcludeCompleted = cancelled !== true && outsourced !== true;
      const orderBaseWhere: Prisma.RadiologyTestOrderWhereInput = {
        isDeleted: false,
        isCancelled: cancelled === true ? true : false,
        isOutSourced: outsourced === true ? true : false,
        test: { isDeleted: false },
        ...(requestedStatuses.length
          ? { status: { in: requestedStatuses as RadiologyOrderStatus[] } }
          : shouldExcludeCompleted
            ? { status: { not: RadiologyOrderStatus["COMPLETED"] } }
            : {}),
      };

      const skip = (page - 1) * limit;
      const and: Prisma.PatientWhereInput[] = [];

      if (requestedStatuses.length) {
        and.push({
          radiologyTestOrders: {
            some: orderBaseWhere,
          },
        });
      }

      if (name) {
        and.push({ firstName: { contains: name } });
      }

      if (opdId) {
        and.push({
          radiologyTestOrders: {
            some: { ...orderBaseWhere, opdId: { equals: opdId } },
          },
        });
      }

      if (createdAtFrom || createdAtTo) {
        and.push({
          radiologyTestOrders: {
            some: {
              ...orderBaseWhere,
              createdAt: {
                ...(createdAtFrom && { gte: createdAtFrom }),
                ...(createdAtTo && { lte: createdAtTo }),
              },
            },
          },
        });
      }

      and.push({
        radiologyTestOrders: {
          some: orderBaseWhere,
        },
      });

      const where: Prisma.PatientWhereInput = and.length ? { AND: and } : {};
      const [items, total] = await prisma.$transaction([
        prisma.patient.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
          include: {
            radiologyTestOrders: {
              where: {
                ...orderBaseWhere,
              },
              select: {
                id: true,
                opdId: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                sampleTakenAt: true,
                resultEnteredAt: true,
                verifiedAt: true,
                isOutSourced: true,
                isCancelled: true,
                scannedReportDocument: {
                  select: {
                    id: true,
                    type: true,
                    path: true,
                    originalName: true,
                    mimeType: true,
                    size: true,
                    createdAt: true,
                  },
                },
                test: {
                  select: {
                    id: true,
                    name: true,
                    section: true,
                  },
                },

                opd: {
                  include: {
                    consultantDoctor: true,
                  },
                },

                resultEnteredBy: {
                  select: {
                    id: true,
                    name: true,
                  },
                },

                verifiedBy: {
                  select: {
                    id: true,
                    name: true,
                  },
                },

                sampleTakenBy: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        }),

        prisma.patient.count({
          where,
        }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Pathology Orders Fetched Successfully",
        data: items,
        total,
      });
    },
  });
};

export const getOrderDetailsAPI = async (req: Request) => {
  return validateRequest({
    querySchema: partialRadiologyTestOrder,
    req,
    onSuccess: async ({ query }) => {
      const { orderId } = query;

      const order = await prisma.radiologyTestOrder.findFirst({
        where: { id: orderId, isDeleted: false, test: { isDeleted: false } },
        include: {
          patient: true,
        },
      });

      if (!order) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Radiology Order Not Found",
        });
      }

      const data = await prisma.radiologyTestOrder.findFirst({
        where: { id: orderId, isDeleted: false, test: { isDeleted: false } },
        include: {
          patient: true,
          results: true,
          test: {
            include: {
              template: true,
            },
          },
        },
      });

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Radiology Order Parameters Fetched Successfully",
        data: { ...data, order },
      });
    },
  });
};

export const updateOrderAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: partialRadiologyTestOrder,
    req,
    onSuccess: async ({ body }) => {
      const { results, orderId, ...rest } = body;

      const order = await prisma.radiologyTestOrder.findUnique({
        where: { id: orderId, isDeleted: false },
      });

      if (!order) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Order not found",
        });
      }

      const updated = await prisma.radiologyTestOrder.update({
        where: { id: orderId },
        data: {
          ...rest,
          ...(rest.isCancelled && { cancelledById: user.id }),
          ...(results && { resultEnteredById: user.id }),
          status: RadiologyOrderStatus["COMPLETED"],
          results: {
            deleteMany: {},
            create: results,
          },
        },
      });

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Order Updated Successfully",
        data: updated,
      });
    },
  });
};

export const cancelOrderAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: partialRadiologyTestOrder,
    req,
    onSuccess: async ({ body }) => {
      const id = body.orderId;

      const order = await prisma.radiologyTestOrder.findUnique({
        where: { id, isDeleted: false },
      });

      if (!order) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Order not found",
        });
      }

      const { isCancelled } = body;

      const updated = await prisma.radiologyTestOrder.update({
        where: { id },
        data: {
          isCancelled,
          ...(isCancelled
            ? { cancelledById: user.id }
            : { cancelledById: null }),
        },
      });

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Order Cancelled Successfully",
        data: updated,
      });
    },
  });
};

export const markOutsourceOrderAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: partialRadiologyTestOrder,
    req,
    onSuccess: async ({ body }) => {
      const id = body.orderId;

      const order = await prisma.radiologyTestOrder.findUnique({
        where: { id, isDeleted: false },
      });

      if (!order) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Order not found",
        });
      }

      const { isOutSourced } = body;

      const updated = await prisma.radiologyTestOrder.update({
        where: { id },
        data: {
          isOutSourced,
        },
      });

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Order Updated Successfully",
        data: updated,
      });
    },
  });
};

export const uploadOutsourcedReportAPI = async (req: Request, user: User) => {
  const formData = await req.formData();
  const orderIdRaw = formData.get("orderId");
  const file = formData.get("file");

  const orderId = typeof orderIdRaw === "string" ? Number(orderIdRaw) : NaN;

  if (!orderId || Number.isNaN(orderId)) {
    return apiResponse({
      status: RESPONSE_STATUS.BAD_REQUEST,
      message: "Invalid orderId",
    });
  }

  if (!(file instanceof File)) {
    return apiResponse({
      status: RESPONSE_STATUS.BAD_REQUEST,
      message: "File is required",
    });
  }

  const order = await prisma.radiologyTestOrder.findUnique({
    where: { id: orderId, isDeleted: false },
    select: {
      id: true,
      isOutSourced: true,
      isCancelled: true,
      scannedReportDocumentId: true,
      scannedReportDocument: {
        select: { id: true, path: true },
      },
    },
  });

  if (!order) {
    return apiResponse({
      status: RESPONSE_STATUS.NOT_FOUND,
      message: "Order not found",
    });
  }

  if (!order.isOutSourced || order.isCancelled) {
    return apiResponse({
      status: RESPONSE_STATUS.BAD_REQUEST,
      message: "Only active outsourced orders can upload reports",
    });
  }

  const saved = await savePublicDocument({ file });

  try {
    const created = await prisma.$transaction(async (tx) => {
      const doc = await tx.documentStore.create({
        data: {
          type: DocumentStoreType.LAB_REPORT_RADIOLOGY,
          path: saved.publicPath,
          originalName: saved.originalName,
          mimeType: saved.mimeType,
          size: saved.size,
          createdBy: user.id,
        },
        select: {
          id: true,
          type: true,
          path: true,
          originalName: true,
          mimeType: true,
          size: true,
          createdAt: true,
        },
      });

      await tx.radiologyTestOrder.update({
        where: { id: orderId },
        data: {
          scannedReportDocumentId: doc.id,
        },
      });

      return doc;
    });

    if (order.scannedReportDocument?.path) {
      try {
        await prisma.documentStore.delete({
          where: { id: order.scannedReportDocument.id },
        });
      } catch { }

      try {
        await deletePublicDocument(order.scannedReportDocument.path);
      } catch { }
    }

    return apiResponse({
      status: RESPONSE_STATUS.SUCCESS,
      message: "Report uploaded successfully",
      data: created,
    });
  } catch (e) {
    try {
      await deletePublicDocument(saved.publicPath);
    } catch { }

    throw e;
  }
};

export const getCompletedOrdersWithResultsAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const { opdId } = query;

      if (!opdId) {
        return apiResponse({
          status: RESPONSE_STATUS.BAD_REQUEST,
          message: "OPD ID is required",
        });
      }

      const orders = await prisma.radiologyTestOrder.findMany({
        where: {
          opdId,
          isDeleted: false,
          status: RadiologyOrderStatus["COMPLETED"],
          test: { isDeleted: false },
        },
        include: {
          test: {
            select: {
              id: true,
              name: true,
              section: true,
              template: {
                select: {
                  id: true,
                  name: true,
                  section: true,
                  content: true,
                },
              },
            },
          },
          results: {
            include: {
              template: {
                select: {
                  id: true,
                  name: true,
                  content: true,
                  section: true,
                },
              },
            },
          },
          patient: {
            select: {
              id: true,
              uhid: true,
              firstName: true,
              lastName: true,
              dob: true,
              gender: true,
            },
          },
          verifiedBy: {
            select: {
              id: true,
              name: true,
            },
          },
          resultEnteredBy: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Completed Radiology Orders with Results Fetched Successfully",
        data: orders,
      });
    },
  });
};
