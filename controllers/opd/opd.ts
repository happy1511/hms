import {
  AddressType,
  ContactType,
  IdentityType,
  Patient,
  Prisma,
  User,
} from "@/generated/prisma/client";
import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { paginationValidator } from "@/validators/api/common/pagination";
import {
  addOpdBillItemValidator,
  addOpdTransactionValidator,
  consultationFileValidator,
  opdValidator,
  partialOpdValidator,
  vitalsValidator,
} from "@/validators/api/opd/opd";

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
            isInQueue: true,
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
                id: true,
                uhid: true,
                lastName: true,
                firstName: true,
                middleName: true,
                dob: true,
                maritalStatus: true,
                relations: true,
                addresses: true,
                contacts: true,
                gender: true,
              },
            },
            vital: true,
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

export const createAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: opdValidator,
    req,
    user,
    onSuccess: async ({ body, user }) => {
      return prisma.$transaction(async (tx) => {
        const { patient, patientId } = body;

        let existingPatient: Patient | undefined | null;
        if (patientId) {
          existingPatient = await tx.patient.findFirst({
            where: { id: body.patientId },
          });

          if (!existingPatient || !existingPatient?.id) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "Patient Not Found",
            });
          } else {
            const relation = patient?.relations?.splice(0, 1);

            if (relation.length) {
              await tx.patientRelations.upsert({
                where: {
                  patientId_name_type: {
                    patientId: existingPatient.id,
                    type: relation[0].type,
                    name: relation[0].name,
                  },
                },
                create: {
                  ...relation[0],
                  patientId: existingPatient.id,
                },
                update: {
                  ...relation[0],
                },
              });
            }

            const homeAddress = patient?.addresses?.find(
              (a) => a.type === AddressType.HOME,
            );

            if (homeAddress) {
              await tx.patientAddress.upsert({
                where: {
                  type_patientId: {
                    patientId: existingPatient.id,
                    type: AddressType.HOME,
                  },
                },
                create: {
                  ...homeAddress,
                  patientId: existingPatient.id,
                },
                update: {
                  ...homeAddress,
                },
              });
            }

            const contactsToUpsert = patient?.contacts?.filter((c) =>
              [
                ContactType.PHONE,
                ContactType.MOBILE,
                ContactType.EMAIL,
              ].includes(c.type),
            );

            if (contactsToUpsert?.length) {
              await Promise.all(
                contactsToUpsert.map((contact) =>
                  tx.patientContact.upsert({
                    where: {
                      type_patientId: {
                        patientId: existingPatient?.id as number,
                        type: contact.type,
                      },
                    },
                    create: {
                      ...contact,
                      patientId: existingPatient?.id as number,
                    },
                    update: {
                      ...contact,
                    },
                  }),
                ),
              );
            }

            const documentToUpsert = patient?.identifications?.filter((c) =>
              [
                IdentityType.ADHAR_CARD,
                IdentityType.VOTER_CARD,
                IdentityType.DRIVING_LICENSE,
                IdentityType.PAN_CARD,
              ].includes(c.type),
            );

            if (documentToUpsert?.length) {
              await Promise.all(
                documentToUpsert.map((identity) =>
                  tx.patientIdentification.upsert({
                    where: {
                      type_patientId: {
                        patientId: existingPatient?.id as number,
                        type: identity.type,
                      },
                    },
                    create: {
                      ...identity,
                      patientId: existingPatient?.id as number,
                    },
                    update: {
                      ...identity,
                    },
                  }),
                ),
              );
            }
          }
        } else {
          const {
            contacts,
            addresses,
            relations,
            identifications,
            emergencyContacts,
            notes,
            ...rest
          } = patient;
          existingPatient = await tx.patient.create({
            data: {
              ...rest,
              contacts: {
                create: contacts,
              },
              addresses: {
                create: addresses,
              },
              relations: {
                create: relations,
              },
              identifications: {
                create: identifications,
              },
              emergencyContacts: {
                create: emergencyContacts,
              },
              notes: {
                create: notes,
              },
            },
          });
        }

        const createdOpd = await tx.opd.create({
          data: {
            patientId: existingPatient.id,
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
                receivedById: user.id,
              })),
            },
          },
        });

        const pathologyServices = await tx.pathologyTestService.findMany({
          where: {
            serviceId: { in: body.billingItem?.map((s) => s.serviceId) },
          },
        });

        if (pathologyServices?.length) {
          await tx.pathologyTestOrder.createMany({
            data: pathologyServices.map((service) => ({
              opdId: createdOpd.id,
              patientId: createdOpd.patientId,
              testId: service.testId,
            })),
          });
        }

        const radiologyServices = await tx.radiologyTestService.findMany({
          where: {
            serviceId: { in: body.billingItem?.map((s) => s.serviceId) },
          },
        });

        if (radiologyServices?.length) {
          await tx.radiologyTestOrder.createMany({
            data: radiologyServices.map((service) => ({
              opdId: createdOpd.id,
              patientId: createdOpd.patientId,
              testId: service.testId,
            })),
          });
        }

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "OPD Created Successfully",
          data: createdOpd,
        });
      });
    },
  });
};

export const addItemAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: addOpdBillItemValidator,
    req,
    user,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const existingOPD = await tx.opd.findFirst({
          where: { id: body.billId },
        });

        if (!existingOPD) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Opd Not Found",
          });
        }

        const updatedOpd = await tx.opd.update({
          where: { id: body.billId },
          data: {
            opdBillingItems: {
              create: [
                {
                  billingSectionId: body.billingSectionId,
                  serviceId: body.serviceId,
                  quantity: body.quantity,
                  rate: body.rate,
                  discountType: body.discountType,
                  discountValue: body.discountValue,
                  total: body.total,
                  createdAt: body.createdAt,
                },
              ],
            },
          },
        });

        const pathologyServices = await tx.pathologyTestService.findMany({
          where: {
            serviceId: { equals: body.serviceId },
          },
        });

        if (pathologyServices?.length) {
          await tx.pathologyTestOrder.createMany({
            data: pathologyServices.map((service) => ({
              opdId: updatedOpd.id,
              patientId: updatedOpd.patientId,
              testId: service.testId,
            })),
          });
        }

        const radiologyServices = await tx.radiologyTestService.findMany({
          where: {
            serviceId: { equals: body.serviceId },
          },
        });

        if (radiologyServices?.length) {
          await tx.radiologyTestOrder.createMany({
            data: radiologyServices.map((service) => ({
              opdId: updatedOpd.id,
              patientId: updatedOpd.patientId,
              testId: service.testId,
            })),
          });
        }

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "OPD Created Successfully",
          data: updatedOpd,
        });
      });
    },
  });
};

export const addTransactionAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: addOpdTransactionValidator,
    req,
    user,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const existingOPD = await tx.opd.findFirst({
          where: { id: body.billId },
        });

        if (!existingOPD) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Opd Not Found",
          });
        }

        const updatedOpd = await tx.opd.update({
          where: { id: body.billId },
          data: {
            transactions: {
              create: [
                {
                  amount: body.amount,
                  mode: body.mode,
                  receivedById: user.id,
                  remarks: body.remarks,
                },
              ],
            },
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Transactions Created Successfully",
          data: updatedOpd,
        });
      });
    },
  });
};

export const getQueueAPI = async (req: Request) => {
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

      and.push({ isInQueue: true });

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
            isInQueue: true,
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
                gender: true,
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

export const deleteQueueAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: partialOpdValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      return prisma.$transaction(async (tx) => {
        const existingOpd = await tx.opd.findUnique({
          where: { id: data.opdId },
        });

        if (!existingOpd) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Opd not found",
          });
        }

        const updatedOpd = await tx.opd.update({
          where: { id: body.opdId },
          data: {
            isInQueue: false,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Opd Removed from queue Successfully",
          data: updatedOpd,
        });
      });
    },
  });
};

export const updateVitalsAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: vitalsValidator,
    req,
    onSuccess: async ({ body }) => {
      const { opdId, ...rest } = body;

      return prisma.$transaction(async (tx) => {
        const existingOpd = await tx.opd.findUnique({
          where: { id: opdId },
        });

        if (!existingOpd) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Opd not found",
          });
        }

        const updatedVitals = await tx.vital.upsert({
          where: { opdId },
          update: {
            ...rest,
          },
          create: {
            opdId,
            ...rest,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Vitals Updated Successfully",
          data: updatedVitals,
        });
      });
    },
  });
};

export const getConsultationAPI = async (
  req: Request,
  { params }: { params: { opdId: number } },
  user: User,
) => {
  return validateRequest({
    paramsSchema: partialOpdValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      const { opdId } = params;

      return prisma.$transaction(async (tx) => {
        const existingOpd = await tx.opd.findUnique({
          where: { id: opdId },
        });

        if (!existingOpd) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Opd not found",
          });
        }

        const consultation = await tx.opd.findUnique({
          where: { id: opdId },
          select: {
            id: true,
            patient: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            consultation: true,
            vital: true,
            advisedPathologyTests: {
              select: {
                testId: true,
              },
            },
            advisedRadiologyTests: {
              select: {
                testId: true,
                test: {
                  select: { name: true, id: true },
                },
              },
            },
            prescription: {
              select: {
                followUpAdvice: true,
                followUpAfterDays: true,
                followUpDate: true,
                otherAdvice: true,
                opdId: true,
                drugs: {
                  select: {
                    name: true,
                    days: true,
                    frequency: true,
                    remarks: true,
                  },
                },
              },
            },
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Consultations Fetched Successfully",
          data: {
            opdId: consultation?.id,
            ...consultation?.consultation,
            advisedPathologyTests: consultation?.advisedPathologyTests?.map(
              (t) => t.testId,
            ),
            advisedRadiologyTests: consultation?.advisedRadiologyTests?.map(
              (t) => t.testId,
            ),
            vitals: { ...consultation?.vital, opdId: consultation?.id },
            prescription: {
              ...consultation?.prescription,
              opdId: consultation?.id,
            },
          },
        });
      });
    },
  });
};

export const updateConsultationAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: consultationFileValidator,
    req,
    onSuccess: async ({ body }) => {
      const {
        opdId,
        vitals,
        prescription,
        advisedPathologyTests = [],
        advisedRadiologyTests = [],
        ...consultationFields
      } = body;

      // -------------------------
      // STEP 1: Validate OPD
      // -------------------------
      const existingOpd = await prisma.opd.findUnique({
        where: { id: opdId },
      });

      if (!existingOpd) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Opd not found",
        });
      }

      // -------------------------
      // STEP 2: Vitals + Consultation (TX 1)
      // -------------------------
      const { opdId: _v1, ...cleanVitals } = vitals;

      const { updatedVitals, consultantFile } = await prisma.$transaction(
        async (tx) => {
          const updatedVitals = await tx.vital.upsert({
            where: { opdId },
            update: { ...cleanVitals },
            create: {
              ...cleanVitals,
              opdId,
            },
          });

          const consultantFile = await tx.opdConsultation.upsert({
            where: { opdId },
            update: {
              ...consultationFields,
              vitalsId: updatedVitals.id,
            },
            create: {
              ...consultationFields,
              opdId,
              vitalsId: updatedVitals.id,
            },
          });

          return { updatedVitals, consultantFile };
        },
      );

      // -------------------------
      // STEP 3: Pathology + Radiology Tests (TX 2)
      // -------------------------
      await prisma.$transaction(async (tx) => {
        // ---------- Pathology ----------
        const existingPathology = await tx.advisedPathologyTests.findMany({
          where: { opdId },
          select: { id: true, testId: true },
        });

        const pathologyToDelete = existingPathology.filter(
          (e) => !advisedPathologyTests?.includes(e.testId),
        );

        const pathologyToAdd = advisedPathologyTests?.filter(
          (id) => !existingPathology.some((e) => e.testId === id),
        );

        if (pathologyToDelete.length) {
          await tx.advisedPathologyTests.deleteMany({
            where: { id: { in: pathologyToDelete.map((x) => x.id) } },
          });
        }

        if (pathologyToAdd?.length) {
          await tx.advisedPathologyTests.createMany({
            data: pathologyToAdd.map((testId) => ({
              opdId,
              consultationId: consultantFile.id,
              testId,
            })),
            skipDuplicates: true,
          });
        }

        // ---------- Radiology ----------
        const existingRadiology = await tx.advisedRadiologyTests.findMany({
          where: { opdId },
          select: { id: true, testId: true },
        });

        const radiologyToDelete = existingRadiology.filter(
          (e) => !advisedRadiologyTests?.includes(e.testId),
        );

        const radiologyToAdd = advisedRadiologyTests?.filter(
          (id) => !existingRadiology.some((e) => e.testId === id),
        );

        if (radiologyToDelete.length) {
          await tx.advisedRadiologyTests.deleteMany({
            where: { id: { in: radiologyToDelete.map((x) => x.id) } },
          });
        }

        if (radiologyToAdd?.length) {
          await tx.advisedRadiologyTests.createMany({
            data: radiologyToAdd.map((testId) => ({
              opdId,
              consultationId: consultantFile.id,
              testId,
            })),
            skipDuplicates: true,
          });
        }
      });

      // -------------------------
      // STEP 4: Prescription + Drugs (TX 3)
      // -------------------------
      await prisma.$transaction(async (tx) => {
        const upsertedPrescription = await tx.prescription.upsert({
          where: { opdId },
          update: {
            followUpAfterDays: prescription.followUpAfterDays,
            followUpAdvice: prescription.followUpAdvice,
            followUpDate: prescription.followUpDate,
            otherAdvice: prescription.otherAdvice,
          },
          create: {
            opdId,
            followUpAfterDays: prescription.followUpAfterDays,
            followUpAdvice: prescription.followUpAdvice,
            followUpDate: prescription.followUpDate,
            otherAdvice: prescription.otherAdvice,
          },
        });

        // Replace drugs efficiently
        await tx.prescribedDrugs.deleteMany({
          where: { opdId },
        });

        if (prescription.drugs?.length) {
          await tx.prescribedDrugs.createMany({
            data: prescription.drugs.map((drug) => ({
              name: drug.name,
              days: drug.days,
              frequency: drug.frequency,
              remarks: drug.remarks,
              opdId,
              prescriptionId: upsertedPrescription.id,
            })),
          });
        }
      });

      // -------------------------
      // FINAL RESPONSE
      // -------------------------
      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Consultations Updated Successfully",
      });
    },
  });
};
