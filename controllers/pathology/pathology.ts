import { prisma } from "@/services/prisma";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { apiResponse } from "@/lib/apiResponse";
import { paginationValidator } from "@/validators/api/common/pagination";
import { Prisma } from "@/generated/prisma/client";
import {
  addOptionToParameterValidator,
  addParameterHeaderToTestValidator,
  addParameterToTestValidator,
  addReferenceRangeToParameterValidator,
  partialOptionValidator,
  partialParameterHeaderValidator,
  partialParameterTestValidator,
  partialPathologyTestValidator,
  partialReferenceRangeValidator,
  pathologyTestValidator,
  updateParameterHeaderToTestValidator,
  updateParameterToTestValidator,
  updateReferenceRangeToParameterValidator,
} from "@/validators/api/masters/pathologyTest";

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

      const where: Prisma.PathologyTestWhereInput = and.length
        ? { AND: and }
        : {};

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

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Pathology Tests Fetched Successfully",
        data: items,
        total,
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
                  lowerDay: true,
                  lowerMonth: true,
                  lowerYear: true,
                  lowerRange: true,
                  upperDay: true,
                  upperMonth: true,
                  upperYear: true,
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
                          param.referenceRanges?.map((range) => ({
                            applicableGender: range.applicableGender,
                            lowerDay: range.lowerDay,
                            upperDay: range.upperDay,
                            lowerMonth: range.lowerMonth,
                            upperMonth: range.upperMonth,
                            lowerYear: range.lowerYear,
                            upperYear: range.upperYear,
                            lowerRange: range.lowerRange,
                            upperRange: range.upperRange,
                            unit: range.unit,
                          })) || [],
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
                      param.referenceRanges?.map((range) => ({
                        applicableGender: range.applicableGender,
                        lowerDay: range.lowerDay,
                        upperDay: range.upperDay,
                        lowerMonth: range.lowerMonth,
                        upperMonth: range.upperMonth,
                        lowerYear: range.lowerYear,
                        upperYear: range.upperYear,
                        lowerRange: range.lowerRange,
                        upperRange: range.upperRange,
                        unit: range.unit,
                      })) || [],
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
                body.referenceRanges?.map((range) => ({
                  applicableGender: range.applicableGender,
                  lowerDay: range.lowerDay,
                  upperDay: range.upperDay,
                  lowerMonth: range.lowerMonth,
                  upperMonth: range.upperMonth,
                  lowerYear: range.lowerYear,
                  upperYear: range.upperYear,
                  lowerRange: range.lowerRange,
                  upperRange: range.upperRange,
                  unit: range.unit,
                })) || [],
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
            headerId: body.headerId,
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
                body.referenceRanges?.map((range) => ({
                  applicableGender: range.applicableGender,
                  lowerDay: range.lowerDay,
                  upperDay: range.upperDay,
                  lowerMonth: range.lowerMonth,
                  upperMonth: range.upperMonth,
                  lowerYear: range.lowerYear,
                  upperYear: range.upperYear,
                  lowerRange: range.lowerRange,
                  upperRange: range.upperRange,
                  unit: range.unit,
                })) || [],
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

        const { parameterId, ...rest } = body;
        const createdHeader = await tx.referenceRange.create({
          data: {
            ...rest,
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

        const { parameterId, ...rest } = body;
        const updatedRange = await tx.referenceRange.update({
          where: { id: existingReferenceRange.id },
          data: {
            ...rest,
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
                    lowerDay: range.lowerDay,
                    upperDay: range.upperDay,
                    lowerMonth: range.lowerMonth,
                    upperMonth: range.upperMonth,
                    lowerYear: range.lowerYear,
                    upperYear: range.upperYear,
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
                  lowerDay: range.lowerDay,
                  upperDay: range.upperDay,
                  lowerMonth: range.lowerMonth,
                  upperMonth: range.upperMonth,
                  lowerYear: range.lowerYear,
                  upperYear: range.upperYear,
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
