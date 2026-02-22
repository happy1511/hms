import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { apiResponse } from "@/lib/apiResponse";
import { paginationValidator } from "@/validators/api/common/pagination";
import {
  PathologyOrderStatus,
  PathologyTest,
  Prisma,
  ReferenceRangeSex,
  ServiceApplicableOn,
  ServiceType,
  User,
} from "@/generated/prisma/client";
import {
  addOptionToParameterValidator,
  addParameterHeaderToTestValidator,
  addParameterToTestValidator,
  addReferenceRangeToParameterValidator,
  partialOptionValidator,
  partialParameterHeaderValidator,
  partialParameterTestValidator,
  partialPathologyTestOrder,
  partialPathologyTestValidator,
  partialReferenceRangeValidator,
  pathologyTestValidator,
  updateParameterHeaderToTestValidator,
  updateParameterToTestValidator,
  updateReferenceRangeToParameterValidator,
} from "@/validators/api/masters/pathologyTest";
import { differenceInDays } from "date-fns";
import { toDays } from "@/lib/utils";

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
      const sectionType = query.pathologyTestType ?? "";
      const defaultSelectedIds = query.defaultSelectedIds;

      const skip = (page - 1) * limit;
      const and: Prisma.PathologyTestWhereInput[] = [];

      if (search) {
        and.push({ name: { contains: search } });
      }

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

      const baseWhere: Prisma.PathologyTestWhereInput = and.length
        ? { AND: and }
        : {};

      let selectedItems: PathologyTest[] = [];
      if (defaultSelectedIds && defaultSelectedIds.length > 0) {
        selectedItems = await prisma.pathologyTest.findMany({
          where: {
            id: { in: defaultSelectedIds },
          },
          select: {
            id: true,
            name: true,
            alias: true,
            container: true,
            sampleType: true,
            footerNotes: true,
            price: true,
            section: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        });
      }

      const where: Prisma.PathologyTestWhereInput = {
        ...baseWhere,
        ...(defaultSelectedIds &&
          defaultSelectedIds.length > 0 && {
            id: { notIn: defaultSelectedIds },
          }),
      };

      const [items, total] = await prisma.$transaction([
        prisma.pathologyTest.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
          select: {
            id: true,
            name: true,
            alias: true,
            container: true,
            sampleType: true,
            footerNotes: true,
            price: true,
            section: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.pathologyTest.count({ where }),
      ]);

      const finalItems = [...selectedItems, ...items];

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Pathology Tests Fetched Successfully",
        data: finalItems,
        total,
      });
    },
  });
};

export const getOrdersAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const status = query.testStatus ?? "";
      const name = query.search ?? "";
      const createdAtFrom = query["createdAt[from]"] ?? "";
      const createdAtTo = query["createdAt[to]"] ?? "";
      // const defaultSelectedIds = query.defaultSelectedIds;
      const cancelled = query.cancelled;
      const outsourced = query.outsourced;
      const opdId = query.opdId;

      const skip = (page - 1) * limit;
      const and: Prisma.PatientWhereInput[] = [];

      if (status) {
        and.push({
          pathologyTestOrders: { some: { status: { in: status } } },
        });
      }

      if (name) {
        and.push({ firstName: { contains: name } });
      }

      if (opdId) {
        and.push({
          pathologyTestOrders: { some: { opdId: { equals: opdId } } },
        });
      }

      if (createdAtFrom || createdAtTo) {
        and.push({
          pathologyTestOrders: {
            some: {
              createdAt: {
                ...(createdAtFrom && { gte: createdAtFrom }),
                ...(createdAtTo && { lte: createdAtTo }),
              },
            },
          },
        });
      }

      and.push({
        pathologyTestOrders: {
          some: {
            isCancelled: cancelled === true ? true : false,
            isOutSourced: outsourced === true ? true : false,
          },
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
            pathologyTestOrders: {
              where: {
                isOutSourced: outsourced === true ? true : false,
                isCancelled: cancelled === true ? true : false,
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
                test: {
                  select: {
                    id: true,
                    name: true,
                    section: true,
                    container: true,
                    sampleType: true,
                  },
                },

                opd: {
                  select: {
                    consultantDoctor: {
                      select: {
                        user: {
                          select: {
                            id: true,
                            name: true,
                          },
                        },
                      },
                    },
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
    querySchema: partialPathologyTestOrder,
    req,
    onSuccess: async ({ query }) => {
      const { orderId } = query;

      const order = await prisma.pathologyTestOrder.findFirst({
        where: { id: orderId },
        include: {
          patient: true,
        },
      });

      if (!order) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Pathology Order Not Found",
        });
      }

      const gender =
        order.patient.gender === "Female"
          ? ReferenceRangeSex["FEMALE"]
          : ReferenceRangeSex["MALE"];

      const ageInDays = differenceInDays(new Date(), order.patient.dob);

      const data = await prisma.pathologyTestOrder.findFirst({
        where: { id: orderId },
        include: {
          patient: true,
          test: {
            include: {
              testHeaders: {
                include: {
                  testParameters: {
                    include: {
                      parameterOptions: true,
                      referenceRanges: {
                        where: {
                          OR: [
                            { applicableGender: gender },
                            { applicableGender: ReferenceRangeSex.Both },
                          ],
                          AND: [
                            { lowerAgeInDays: { lte: ageInDays } },
                            { upperAgeInDays: { gte: ageInDays } },
                          ],
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Pathology Order Parameters Fetched Successfully",
        data: { ...data, order },
      });
    },
  });
};

export const updateOrderAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: partialPathologyTestOrder,
    req,
    onSuccess: async ({ body }) => {
      const { results, orderId, ...rest } = body;

      const order = await prisma.pathologyTestOrder.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Order not found",
        });
      }

      const updated = await prisma.pathologyTestOrder.update({
        where: { id: orderId },
        data: {
          ...rest,
          ...(rest.isCancelled && { cancelledById: user.id }),
          ...(results?.length && { resultEnteredById: user.id }),
          status: PathologyOrderStatus["COMPLETED"],
          results: {
            deleteMany: {},
            create: results?.map((r) => ({
              ...r,
            })),
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
    bodySchema: partialPathologyTestOrder,
    req,
    onSuccess: async ({ body }) => {
      const id = body.orderId;

      const order = await prisma.pathologyTestOrder.findUnique({
        where: { id },
      });

      if (!order) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Order not found",
        });
      }

      const { isCancelled } = body;

      const updated = await prisma.pathologyTestOrder.update({
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
    bodySchema: partialPathologyTestOrder,
    req,
    onSuccess: async ({ body }) => {
      const id = body.orderId;

      const order = await prisma.pathologyTestOrder.findUnique({
        where: { id },
      });

      if (!order) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Order not found",
        });
      }

      const { isOutSourced } = body;

      const updated = await prisma.pathologyTestOrder.update({
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

export const markAsSampleTakenOrderAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: partialPathologyTestOrder,
    req,
    onSuccess: async ({ body }) => {
      const id = body.orderId;

      const order = await prisma.pathologyTestOrder.findUnique({
        where: { id, status: PathologyOrderStatus["SAMPLE_PENDING"] },
      });

      if (!order) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Order not found",
        });
      }

      const updated = await prisma.pathologyTestOrder.update({
        where: { id },
        data: {
          status: PathologyOrderStatus["RESULT_PENDING"],
          sampleTakenById: user.id,
          sampleTakenAt: new Date(),
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

export const getDetailsAPI = async (
  req: Request,
  { params }: { params: { testId: number } },
) => {
  return validateRequest({
    paramsSchema: partialPathologyTestValidator,
    req,
    params,
    onSuccess: async ({ params }) => {
      const id = params.testId;

      const test = await prisma.pathologyTest.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          alias: true,
          container: true,
          sampleType: true,
          footerNotes: true,
          price: true,
          section: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          testHeaders: {
            select: {
              id: true,
              name: true,
              note: true,
              displayOrder: true,
            },
          },
          parameters: {
            select: {
              id: true,
              name: true,
              isDescriptiveOnly: true,
              headerId: true,
              displayOrder: true,
              header: {
                select: {
                  id: true,
                  name: true,
                  note: true,
                },
              },
              parameterOptions: {
                select: {
                  id: true,
                  testParameterId: true,
                  value: true,
                },
              },
              referenceRanges: {
                select: {
                  id: true,
                  lowerAgeInDays: true,
                  upperAgeInDays: true,
                  upperRange: true,
                  unit: true,
                  applicableGender: true,
                },
              },
            },
          },
        },
      });

      if (!test) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Test not found",
        });
      }

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Test Fetched Successfully",
        data: test,
      });
    },
  });
};

export const createAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: pathologyTestValidator,
    req,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const existingTest = await tx.pathologyTest.findFirst({
          where: { name: body.name },
        });

        if (existingTest) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Test with this name already exists",
          });
        }

        const createdTest = await tx.pathologyTest.create({
          data: {
            name: body.name,
            alias: body.alias,
            price: body.price,
            status: body.status,
            section: body.section,
            container: body.container,
            sampleType: body.sampleType,
            footerNotes: body.footerNotes,

            /** ---------------- HEADERS WITH PARAMETERS ---------------- */
            testHeaders: {
              create:
                body.headers?.map((header) => ({
                  name: header.name,
                  note: header.note,
                  displayOrder: header.displayOrder,

                  testParameters: {
                    create: header.parameters?.map((param) => ({
                      name: param.name,
                      displayOrder: param.displayOrder,
                      isDescriptiveOnly: param.isDescriptiveOnly,

                      referenceRanges: {
                        create:
                          param.referenceRanges?.map((range) => {
                            const lowerAgeInDays = toDays(
                              range.lowerAgeDay,
                              range.lowerAgeMonth,
                              range.lowerAgeYear,
                            );

                            const upperAgeInDays = toDays(
                              range.upperAgeDay,
                              range.upperAgeMonth,
                              range.upperAgeYear,
                            );

                            return {
                              applicableGender: range.applicableGender,
                              lowerAgeInDays,
                              upperAgeInDays,
                              lowerRange: range.lowerRange,
                              upperRange: range.upperRange,
                              unit: range.unit,
                            };
                          }) || [],
                      },

                      parameterOptions: {
                        create:
                          param.parameterOptions?.map((option) => ({
                            value: option.value,
                          })) || [],
                      },
                    })),
                  },
                })) || [],
            },

            /** ---------------- STANDALONE PARAMETERS ---------------- */
            parameters: {
              create:
                body.parameters?.map((param) => ({
                  name: param.name,
                  displayOrder: param.displayOrder,
                  isDescriptiveOnly: param.isDescriptiveOnly,

                  referenceRanges: {
                    create:
                      param.referenceRanges?.map((range) => {
                        const lowerAgeInDays = toDays(
                          range.lowerAgeDay,
                          range.lowerAgeMonth,
                          range.lowerAgeYear,
                        );

                        const upperAgeInDays = toDays(
                          range.upperAgeDay,
                          range.upperAgeMonth,
                          range.upperAgeYear,
                        );
                        return {
                          applicableGender: range.applicableGender,
                          lowerAgeDay: range.lowerAgeDay,
                          upperAgeDay: range.upperAgeDay,
                          lowerAgeInDays,
                          upperAgeInDays,
                          lowerRange: range.lowerRange,
                          upperRange: range.upperRange,
                          unit: range.unit,
                        };
                      }) || [],
                  },

                  parameterOptions: {
                    create:
                      param.parameterOptions?.map((option) => ({
                        value: option.value,
                      })) || [],
                  },
                })) || [],
            },
          },
          include: {
            testHeaders: {
              include: {
                testParameters: {
                  include: {
                    referenceRanges: true,
                    parameterOptions: true,
                  },
                },
              },
            },
            parameters: {
              include: {
                referenceRanges: true,
                parameterOptions: true,
              },
            },
          },
        });

        await tx.service.create({
          data: {
            name: body.name,
            type: ServiceType["LAB_TEST"],
            price: body.price,
            applicableOn: ServiceApplicableOn["BOTH"],
            status: body.status,
            pathologyTests: {
              create: {
                testId: createdTest.id,
              },
            },
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Pathology Test Created Successfully",
          data: createdTest,
        });
      });
    },
  });
};

export const addParameterAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: addParameterToTestValidator,
    req,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const existingTest = await tx.pathologyTest.findFirst({
          where: { id: body.testId },
        });

        if (!existingTest) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Test with this id does not exists",
          });
        }

        if (body.headerId) {
          const existingHeader = await tx.pathologyTestHeader.findFirst({
            where: { id: body.headerId, testId: body.testId },
          });

          if (!existingHeader) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "Header not found for the given test",
            });
          }
        }

        const createdParam = await tx.pathologyTestParameter.create({
          data: {
            name: body.name,
            displayOrder: body.displayOrder,
            isDescriptiveOnly: body.isDescriptiveOnly,
            testId: body.testId,
            headerId: body.headerId,
            referenceRanges: {
              create:
                body.referenceRanges?.map((range) => {
                  const lowerAgeInDays = toDays(
                    range.lowerAgeDay,
                    range.lowerAgeMonth,
                    range.lowerAgeYear,
                  );

                  const upperAgeInDays = toDays(
                    range.upperAgeDay,
                    range.upperAgeMonth,
                    range.upperAgeYear,
                  );
                  return {
                    applicableGender: range.applicableGender,
                    lowerAgeInDays,
                    upperAgeInDays,
                    lowerRange: range.lowerRange,
                    upperRange: range.upperRange,
                    unit: range.unit,
                  };
                }) || [],
            },
            parameterOptions: {
              create:
                body.parameterOptions?.map((option) => ({
                  value: option.value,
                })) || [],
            },
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Pathology Test Parameter Created Successfully",
          data: createdParam,
        });
      });
    },
  });
};

export const updateParameterAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: updateParameterToTestValidator,
    req,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const existingParameter = await tx.pathologyTestParameter.findFirst({
          where: {
            id: body.parameterId,
            testId: body.testId,
          },
        });

        if (!existingParameter) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Test Parameter with this Id does not exists",
          });
        }

        const existingTest = await tx.pathologyTest.findFirst({
          where: { id: body.testId },
        });

        if (!existingTest) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Test with Id does not exists",
          });
        }

        if (body.headerId) {
          const existingHeader = await tx.pathologyTestHeader.findFirst({
            where: { id: body.headerId, testId: body.testId },
          });

          if (!existingHeader) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "Header not found for the given test",
            });
          }
        }

        const updatedParam = await tx.pathologyTestParameter.update({
          where: { id: existingParameter.id },
          data: {
            name: body.name,
            displayOrder: body.displayOrder,
            isDescriptiveOnly: body.isDescriptiveOnly,
            testId: body.testId,
            headerId: body.headerId,
            referenceRanges: {
              deleteMany: {},
              create:
                body.referenceRanges?.map((range) => {
                  const lowerAgeInDays = toDays(
                    range.lowerAgeDay,
                    range.lowerAgeMonth,
                    range.lowerAgeYear,
                  );

                  const upperAgeInDays = toDays(
                    range.upperAgeDay,
                    range.upperAgeMonth,
                    range.upperAgeYear,
                  );
                  return {
                    applicableGender: range.applicableGender,
                    lowerAgeInDays,
                    upperAgeInDays,
                    lowerRange: range.lowerRange,
                    upperRange: range.upperRange,
                    unit: range.unit,
                  };
                }) || [],
            },
            parameterOptions: {
              deleteMany: {},
              create:
                body.parameterOptions?.map((option) => ({
                  value: option.value,
                })) || [],
            },
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Pathology Test Parameter Updated Successfully",
          data: updatedParam,
        });
      });
    },
  });
};

export const deleteParameterApi = async (req: Request) => {
  return validateRequest({
    bodySchema: partialParameterTestValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      return prisma.$transaction(async (tx) => {
        const existingParameter = await tx.pathologyTestParameter.findUnique({
          where: { id: data.parameterId },
        });

        if (!existingParameter) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Pathology Test Parameter not found",
          });
        }

        await prisma.pathologyTestParameter.delete({
          where: { id: data.parameterId },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Pathology Test Parameter Deleted Successfully",
          data: null,
        });
      });
    },
  });
};

export const addParameterHeaderAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: addParameterHeaderToTestValidator,
    req,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const existingTest = await tx.pathologyTest.findFirst({
          where: { id: body.testId },
        });

        if (!existingTest) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Test with this id does not exists",
          });
        }

        const createdHeader = await tx.pathologyTestHeader.create({
          data: {
            name: body.name,
            displayOrder: body.displayOrder,
            testId: body.testId,
            note: body.note,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Pathology Test Parameter Created Successfully",
          data: createdHeader,
        });
      });
    },
  });
};

export const updateParameterHeaderAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: updateParameterHeaderToTestValidator,
    req,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const existingParameterHeader = await tx.pathologyTestHeader.findFirst({
          where: {
            id: body.headerId,
            testId: body.testId,
          },
        });

        if (!existingParameterHeader) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Test Parameter Header with this Id does not exists",
          });
        }

        const existingTest = await tx.pathologyTest.findFirst({
          where: { id: body.testId },
        });

        if (!existingTest) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Test with Id does not exists",
          });
        }

        const updatedParamHeader = await tx.pathologyTestHeader.update({
          where: { id: existingParameterHeader.id },
          data: {
            name: body.name,
            displayOrder: body.displayOrder,
            testId: body.testId,
            note: body.note,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Pathology Test Parameter Header Updated Successfully",
          data: updatedParamHeader,
        });
      });
    },
  });
};

export const deleteParameterHeaderAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: partialParameterHeaderValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      return prisma.$transaction(async (tx) => {
        const existingParameter = await tx.pathologyTestHeader.findUnique({
          where: { id: data.headerId },
        });

        if (!existingParameter) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Pathology Test Parameter Header not found",
          });
        }

        await prisma.pathologyTestHeader.delete({
          where: { id: data.headerId },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Pathology Test Parameter Header Deleted Successfully",
          data: null,
        });
      });
    },
  });
};

export const addReferenceRangeAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: addReferenceRangeToParameterValidator,
    req,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const existingParameter = await tx.pathologyTestParameter.findFirst({
          where: { id: body.parameterId },
        });

        if (!existingParameter) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Parameter with this id does not exists",
          });
        }

        const {
          parameterId,
          lowerAgeDay,
          lowerAgeMonth,
          lowerAgeYear,
          upperAgeDay,
          upperAgeMonth,
          upperAgeYear,
          ...rest
        } = body;

        const lowerAgeInDays = toDays(lowerAgeDay, lowerAgeMonth, lowerAgeYear);
        const upperAgeInDays = toDays(upperAgeDay, upperAgeMonth, upperAgeYear);

        console.log(lowerAgeInDays, upperAgeInDays, body);

        const createdHeader = await tx.referenceRange.create({
          data: {
            ...rest,
            lowerAgeInDays,
            upperAgeInDays,
            testParameterId: parameterId,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Reference Range Created Successfully",
          data: createdHeader,
        });
      });
    },
  });
};

export const updateReferenceRangeAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: updateReferenceRangeToParameterValidator,
    req,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const existingReferenceRange = await tx.referenceRange.findFirst({
          where: {
            id: body.referenceRangeId,
          },
        });

        if (!existingReferenceRange) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Range with this Id does not exists",
          });
        }

        const existingParameter = await tx.pathologyTestParameter.findFirst({
          where: { id: body.parameterId },
        });

        if (!existingParameter) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Test Parameter with Id does not exists",
          });
        }

        const {
          parameterId,
          lowerAgeDay,
          lowerAgeMonth,
          lowerAgeYear,
          upperAgeDay,
          upperAgeMonth,
          upperAgeYear,
          ...rest
        } = body;

        const lowerAgeInDays = toDays(lowerAgeDay, lowerAgeMonth, lowerAgeYear);
        const upperAgeInDays = toDays(upperAgeDay, upperAgeMonth, upperAgeYear);

        const updatedRange = await tx.referenceRange.update({
          where: { id: existingReferenceRange.id },
          data: {
            ...rest,
            lowerAgeInDays,
            upperAgeInDays,
            testParameterId: parameterId,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Range Updated Successfully",
          data: updatedRange,
        });
      });
    },
  });
};

export const deleteReferenceRangeAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: partialReferenceRangeValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      return prisma.$transaction(async (tx) => {
        const existingParameter = await tx.referenceRange.findUnique({
          where: { id: data.referenceRangeId },
        });

        if (!existingParameter) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Range not found",
          });
        }

        await prisma.referenceRange.delete({
          where: { id: data.referenceRangeId },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Range Deleted Successfully",
          data: null,
        });
      });
    },
  });
};

export const addOptionAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: addOptionToParameterValidator,
    req,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const existingParameter = await tx.pathologyTestParameter.findFirst({
          where: { id: body.parameterId },
        });

        if (!existingParameter) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Parameter with this id does not exists",
          });
        }

        const { parameterId, ...rest } = body;
        const createdHeader = await tx.parameterOptions.create({
          data: {
            ...rest,
            testParameterId: parameterId,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Option Created Successfully",
          data: createdHeader,
        });
      });
    },
  });
};

export const deleteOptionAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: partialOptionValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      return prisma.$transaction(async (tx) => {
        const existingParameter = await tx.parameterOptions.findUnique({
          where: { id: data.optionId },
        });

        if (!existingParameter) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Option not found",
          });
        }

        await prisma.parameterOptions.delete({
          where: { id: data.optionId },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Option Deleted Successfully",
          data: null,
        });
      });
    },
  });
};

export const updateAPI = async (
  req: Request,
  { params }: { params: { testId: number } },
) => {
  return validateRequest({
    bodySchema: partialPathologyTestValidator,
    paramsSchema: partialPathologyTestValidator,
    params,
    req,
    onSuccess: async ({ body, params }) => {
      return prisma.$transaction(async (tx) => {
        const existingTest = await tx.pathologyTest.findUnique({
          where: { id: params.testId },
        });

        if (!existingTest) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Pathology test not found",
          });
        }

        /** ---------------- BASIC UPDATE ---------------- */
        await tx.pathologyTest.update({
          where: { id: body.testId },
          data: {
            name: body.name,
            alias: body.alias,
            price: body.price,
            status: body.status,
            section: body.section,
            container: body.container,
            sampleType: body.sampleType,
            footerNotes: body.footerNotes,
          },
        });

        /** ---------------- CLEAN EXISTING DATA ---------------- */
        await tx.pathologyTestHeader.deleteMany({
          where: { testId: body.testId },
        });

        await tx.pathologyTestParameter.deleteMany({
          where: { testId: body.testId },
        });

        /** ---------------- RECREATE HEADERS + PARAMETERS ---------------- */
        await tx.pathologyTestHeader.createMany({
          data:
            body.headers?.map((header) => ({
              testId: body.testId,
              name: header.name,
              note: header.note,
              displayOrder: header.displayOrder,
            })) || [],
        });

        if (body.headers?.length) {
          const createdHeaders = await tx.pathologyTestHeader.findMany({
            where: { testId: body.testId },
          });

          for (const header of body.headers) {
            const dbHeader = createdHeaders.find(
              (h) =>
                h.name === header.name &&
                h.displayOrder === header.displayOrder,
            );

            if (!dbHeader) continue;

            for (const param of header.parameters || []) {
              const createdParam = await tx.pathologyTestParameter.create({
                data: {
                  name: param.name,
                  displayOrder: param.displayOrder,
                  isDescriptiveOnly: param.isDescriptiveOnly,
                  testId: body.testId,
                  headerId: dbHeader.id,
                },
              });

              if (param.referenceRanges?.length) {
                await tx.referenceRange.createMany({
                  data: param.referenceRanges.map((range) => ({
                    testParameterId: createdParam.id,
                    applicableGender: range.applicableGender,
                    lowerAgeDay: range.lowerAgeDay,
                    upperAgeDay: range.upperAgeDay,
                    lowerAgeMonth: range.lowerAgeMonth,
                    upperAgeMonth: range.upperAgeMonth,
                    lowerAgeYear: range.lowerAgeYear,
                    upperAgeYear: range.upperAgeYear,
                    lowerRange: range.lowerRange,
                    upperRange: range.upperRange,
                    unit: range.unit,
                  })),
                });
              }

              if (param.parameterOptions?.length) {
                await tx.parameterOptions.createMany({
                  data: param.parameterOptions.map((opt) => ({
                    testParameterId: createdParam.id,
                    value: opt.value,
                  })),
                });
              }
            }
          }
        }

        /** ---------------- STANDALONE PARAMETERS ---------------- */
        if (body.parameters?.length) {
          for (const param of body.parameters) {
            const createdParam = await tx.pathologyTestParameter.create({
              data: {
                name: param.name,
                displayOrder: param.displayOrder,
                isDescriptiveOnly: param.isDescriptiveOnly,
                testId: body.testId,
              },
            });

            if (param.referenceRanges?.length) {
              await tx.referenceRange.createMany({
                data: param.referenceRanges.map((range) => ({
                  testParameterId: createdParam.id,
                  applicableGender: range.applicableGender,
                  lowerAgeDay: range.lowerAgeDay,
                  upperAgeDay: range.upperAgeDay,
                  lowerAgeMonth: range.lowerAgeMonth,
                  upperAgeMonth: range.upperAgeMonth,
                  lowerAgeYear: range.lowerAgeYear,
                  upperAgeYear: range.upperAgeYear,
                  lowerRange: range.lowerRange,
                  upperRange: range.upperRange,
                  unit: range.unit,
                })),
              });
            }

            if (param.parameterOptions?.length) {
              await tx.parameterOptions.createMany({
                data: param.parameterOptions.map((opt) => ({
                  testParameterId: createdParam.id,
                  value: opt.value,
                })),
              });
            }
          }
        }

        const updatedTest = await tx.pathologyTest.findUnique({
          where: { id: body.testId },
          include: {
            testHeaders: {
              include: {
                testParameters: {
                  include: {
                    referenceRanges: true,
                    parameterOptions: true,
                  },
                },
              },
            },
            parameters: {
              include: {
                referenceRanges: true,
                parameterOptions: true,
              },
            },
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Pathology Test Updated Successfully",
          data: updatedTest,
        });
      });
    },
  });
};

export const deleteAPI = async (
  req: Request,
  { params }: { params: { testId: number } },
) => {
  return validateRequest({
    bodySchema: partialPathologyTestValidator,
    paramsSchema: partialPathologyTestValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      return prisma.$transaction(async (tx) => {
        const existingTest = await tx.pathologyTest.findUnique({
          where: { id: data.testId },
        });

        if (!existingTest) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Pathology Test not found",
          });
        }

        await prisma.pathologyTest.delete({
          where: { id: data.testId },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Pathology Test Deleted Successfully",
          data: null,
        });
      });
    },
  });
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

      const orders = await prisma.pathologyTestOrder.findMany({
        where: {
          opdId,
          status: PathologyOrderStatus["COMPLETED"],
        },
        include: {
          test: {
            select: {
              id: true,
              name: true,
              section: true,
              container: true,
              sampleType: true,
            },
          },
          results: {
            include: {
              parameter: {
                select: {
                  id: true,
                  name: true,
                  isDescriptiveOnly: true,
                  parameterOptions: true,
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

      if (!orders || orders.length === 0) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "No completed pathology orders found for this OPD",
          data: [],
        });
      }

      // Get all unique parameter IDs to batch fetch reference ranges
      const allParameterIds = [
        ...new Set(
          orders.flatMap((order) =>
            order.results.map((result) => result.parameterId),
          ),
        ),
      ];

      // Fetch all reference ranges in a single query
      const allReferenceRanges = await prisma.referenceRange.findMany({
        where: {
          testParameterId: { in: allParameterIds },
        },
      });

      // Enrich orders with appropriate reference ranges based on patient age and gender
      const enrichedOrders = orders.map((order) => {
        const gender =
          order.patient.gender === "Female"
            ? ReferenceRangeSex["FEMALE"]
            : ReferenceRangeSex["MALE"];

        const ageInDays = differenceInDays(new Date(), order.patient.dob);

        const enrichedResults = order.results.map((result) => {
          const applicableReferenceRanges = allReferenceRanges.filter(
            (range) =>
              range.testParameterId === result.parameterId &&
              (range.applicableGender === gender ||
                range.applicableGender === ReferenceRangeSex.Both) &&
              (!range.lowerAgeInDays || range.lowerAgeInDays <= ageInDays) &&
              (!range.upperAgeInDays || range.upperAgeInDays >= ageInDays),
          );

          console.log(ageInDays, allReferenceRanges, gender);

          return {
            ...result,
            applicableReferenceRanges,
          };
        });

        return {
          ...order,
          results: enrichedResults,
        };
      });

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Completed Pathology Orders with Results Fetched Successfully",
        data: enrichedOrders,
      });
    },
  });
};
