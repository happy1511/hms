import {
  AddressType,
  ContactType,
  DiscountType,
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
            invoice: { include: { transactions: true } },
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
            invoice: { include: { transactions: true } },
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
        const consultation = await tx.opd.findUnique({
          where: { id: opdId },
          select: {
            id: true,
            createdAt: true,
            patientId: true,
            patient: {
              select: {
                id: true,
                uhid: true,
                firstName: true,
                lastName: true,
                gender: true,
                contacts: {
                  where: {
                    type: {
                      in: [ContactType.PHONE, ContactType.MOBILE],
                    },
                  },
                  select: {
                    type: true,
                    value: true,
                  },
                },
                addresses: {
                  where: {
                    type: AddressType.HOME,
                  },
                  select: {
                    addressLineOne: true,
                    addressLineTwo: true,
                    addressLineThree: true,
                    location: {
                      select: {
                        city: true,
                        state: true,
                        country: true,
                        postcode: true,
                      },
                    },
                  },
                },
              },
            },
            consultantDoctor: {
              select: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            referringDoctor: {
              select: {
                user: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            consultation: true,
            vital: true,
            advisedPathologyTests: {
              include: {
                test: true,
              },
            },
            advisedRadiologyTests: {
              include: {
                test: true,
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

        if (!consultation) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Opd not found",
          });
        }

        const previousOpds = consultation?.patientId
          ? await tx.opd.findMany({
              where: {
                patientId: consultation.patientId,
                id: { not: opdId },
              },
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                createdAt: true,
                advisedPathologyTests: {
                  select: {
                    test: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
                advisedRadiologyTests: {
                  select: {
                    test: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            })
          : [];

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Consultations Fetched Successfully",
          data: {
            opdId: consultation?.id,
            ...consultation?.consultation,
            advisedPathologyTests: consultation?.advisedPathologyTests?.map(
              (t) => ({ name: t.test.name, id: t.testId }),
            ),
            advisedRadiologyTests: consultation?.advisedRadiologyTests?.map(
              (t) => ({ name: t.test.name, id: t.testId }),
            ),
            vitals: { ...consultation?.vital, opdId: consultation?.id },
            prescription: {
              ...consultation?.prescription,
              opdId: consultation?.id,
            },
            patient: consultation?.patient,
            consultantDoctorName: consultation?.consultantDoctor?.user?.name,
            referringDoctorName: consultation?.referringDoctor?.user?.name,
            createdAt: consultation?.createdAt,
            previousOpdHistory: previousOpds.map((opd) => ({
              opdId: opd.id,
              createdAt: opd.createdAt,
              investigations: Array.from(
                new Set([
                  ...opd.advisedPathologyTests.map((item) => item.test.name),
                  ...opd.advisedRadiologyTests.map((item) => item.test.name),
                ]),
              ),
            })),
          },
        });
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
            const firstRelation = relation?.[0];

            if (firstRelation?.type && firstRelation?.name?.trim()) {
              await tx.patientRelations.upsert({
                where: {
                  patientId_name_type: {
                    patientId: existingPatient.id,
                    type: firstRelation.type,
                    name: firstRelation.name.trim(),
                  },
                },
                create: {
                  type: firstRelation.type,
                  name: firstRelation.name.trim(),
                  contact: firstRelation.contact ?? null,
                  patientId: existingPatient.id,
                },
                update: {
                  type: firstRelation.type,
                  name: firstRelation.name.trim(),
                  contact: firstRelation.contact ?? null,
                },
              });
            }

            const homeAddress = patient?.addresses?.find(
              (a) => a.type === AddressType.HOME,
            );

            if (homeAddress) {
              const { location, ...rest } = homeAddress;
              await tx.patientAddress.upsert({
                where: {
                  type_patientId: {
                    patientId: existingPatient.id,
                    type: AddressType.HOME,
                  },
                },
                create: {
                  ...rest,
                  locationId: location.id,
                  patientId: existingPatient.id,
                },
                update: {
                  ...rest,
                  locationId: location.id,
                },
              });
            }

            const contactsToUpsert = (patient?.contacts ?? [])
              .filter(
                (c) =>
                  [
                    ContactType.PHONE,
                    ContactType.MOBILE,
                    ContactType.EMAIL,
                  ].includes(c.type) && Boolean(c.value?.trim()),
              )
              .map((c) => ({
                type: c.type,
                value: String(c.value).trim(),
              }));

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

            const documentToUpsert = (patient?.identifications ?? [])
              .filter(
                (c) =>
                  [
                    IdentityType.ADHAR_CARD,
                    IdentityType.VOTER_CARD,
                    IdentityType.DRIVING_LICENSE,
                    IdentityType.PAN_CARD,
                  ].includes(c.type) && Boolean(c.number?.trim()),
              )
              .map((c) => ({
                type: c.type,
                number: String(c.number).trim(),
                active: c.active,
              }));

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
                create: contacts
                  .filter((c) => Boolean(c.value?.trim()))
                  .map((c) => ({
                    type: c.type,
                    value: String(c.value).trim(),
                  })),
              },
              addresses: {
                create: addresses.map((l) => ({
                  addressLineOne: l.addressLineOne,
                  addressLineThree: l.addressLineThree,
                  addressLineTwo: l.addressLineTwo,
                  locationId: l.location.id,
                  type: l.type,
                })),
              },
              relations: {
                create: relations
                  .filter((r) => Boolean(r.type) && Boolean(r.name?.trim()))
                  .map((r) => ({
                    type: r.type!,
                    name: String(r.name).trim(),
                    contact: r.contact ?? null,
                  })),
              },
              identifications: {
                create: identifications
                  .filter((i) => Boolean(i.number?.trim()))
                  .map((i) => ({
                    type: i.type,
                    number: String(i.number).trim(),
                    active: i.active,
                  })),
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

        const { billingItems, createdAt, transactions, ...rest } = body.invoice;

        const groupedBillingItems = new Map<number, typeof billingItems>();

        billingItems?.forEach((item) => {
          const existingSectionItems =
            groupedBillingItems.get(item.billingSection.id) || [];
          existingSectionItems.push(item);
          groupedBillingItems.set(item.billingSection.id, existingSectionItems);
        });

        const invoice = await tx.invoice.create({
          data: {
            ...rest,
            createdBy: user.id,
            updatedBy: user.id,
            transactions: {
              create:
                transactions?.map((transaction) => ({
                  amount: transaction.amount,
                  mode: transaction.mode,
                  remarks: transaction.remarks,
                  receivedById: user.id,
                })) || [],
            },
            opd: {
              create: {
                patientId: existingPatient.id,
                arrivalState: body.arrivalState,
                remarks: body.remarks,
                consultantDoctorId: body.consultantDoctor.userId,
                referringDoctorId: body.referredDoctor?.userId,
                createdBy: user.id,
                updatedBy: user.id,
                createdAt: createdAt,
              },
            },
          },
          include: { opd: true },
        });

        for (const [billingSectionId, sectionItems] of groupedBillingItems) {
          const invoiceBillingSection = await tx.invoiceBillingSection.create({
            data: {
              invoiceId: invoice.id,
              billingSectionId,
              discountType: DiscountType.VALUE,
              discountValue: 0,
              createdBy: user.id,
              updatedBy: user.id,
              createdAt,
            },
          });

          if (!sectionItems.length) {
            continue;
          }

          await tx.invoiceBillingItem.createMany({
            data: sectionItems.map((item) => ({
              invoiceId: invoice.id,
              invoiceBillingSectionId: invoiceBillingSection.id,
              billingSectionId: item.billingSection.id,
              serviceId: item.service.id,
              quantity: item.quantity,
              rate: item.rate,
              discountType: item.discountType,
              discountValue: item.discountValue,
              total: item.total,
              createdBy: user.id,
              updatedBy: user.id,
              createdAt,
            })),
          });
        }

        const pathologyServices = await tx.pathologyTestService.findMany({
          where: {
            serviceId: { in: billingItems?.map((s) => s.service.id) },
          },
        });

        if (pathologyServices?.length) {
          await tx.pathologyTestOrder.createMany({
            data: pathologyServices.map((service) => ({
              opdId: invoice.opd!.id,
              patientId: invoice.opd!.patientId,
              testId: service.testId,
            })),
          });
        }

        const radiologyServices = await tx.radiologyTestService.findMany({
          where: {
            serviceId: { in: billingItems?.map((s) => s.service.id) },
          },
        });

        if (radiologyServices?.length) {
          await tx.radiologyTestOrder.createMany({
            data: radiologyServices.map((service) => ({
              opdId: invoice.opd!.id,
              patientId: invoice.opd!.patientId,
              testId: service.testId,
            })),
          });
        }

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "OPD Created Successfully",
          data: invoice,
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
          (e) => !advisedPathologyTests?.find((t) => t.id === e.testId),
        );

        const pathologyToAdd = advisedPathologyTests?.filter(
          (test) => !existingPathology.some((e) => e.testId === test.id),
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
              testId: testId.id,
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
          (e) => !advisedRadiologyTests?.find((t) => t.id === e.testId),
        );

        const radiologyToAdd = advisedRadiologyTests?.filter(
          (test) => !existingRadiology.some((e) => e.testId === test.id),
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
              testId: testId.id,
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

export const deleteQueueAPI = async (req: Request, user: User) => {
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
            updatedBy: user.id,
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
