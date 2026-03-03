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
import { ipdValidator, partialIpdValidator } from "@/validators/api/ipd/ipd";

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
      const isDischarged = query.isDischarged ?? "";

      const skip = (page - 1) * limit;
      const and: Prisma.IpdWhereInput[] = [];

      if (consultantDoctorId) {
        and.push({ consultantDoctorId });
      }
      if (referringDoctorId) {
        and.push({ referringDoctorId });
      }

      if (typeof isDischarged == "boolean") {
        and.push({ isDischarged: isDischarged });
      }

      if (createdAtFrom || createdAtTo) {
        and.push({
          createdAt: {
            ...(createdAtFrom && { gte: createdAtFrom }),
            ...(createdAtTo && { lte: createdAtTo }),
          },
        });
      }

      const where: Prisma.IpdWhereInput = and.length ? { AND: and } : {};

      const [items, total] = await prisma.$transaction([
        prisma.ipd.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
          include: {
            invoice: { include: { transactions: true } },
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
          },
        }),
        prisma.ipd.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Ipds Fetched Successfully",
        data: items,
        total,
      });
    },
  });
};

export const createAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: ipdValidator,
    req,
    user,
    onSuccess: async ({ body, user }) => {
      return prisma.$transaction(async (tx) => {
        const { patient, patientId, bed } = body;

        const existingBed = await prisma.bed.findFirst({
          where: { id: bed.id, isOccupied: false, isDeleted: false },
        });

        if (!existingBed) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Bed Not Found",
          });
        }

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
                  [ContactType.PHONE, ContactType.MOBILE, ContactType.EMAIL].includes(
                    c.type,
                  ) && Boolean(c.value?.trim()),
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

        const invoice = await tx.invoice.create({
          data: {
            ...rest,
            billingItems: {
              create:
                billingItems?.map((item) => ({
                  billingSectionId: item.billingSection.id,
                  serviceId: item.service.id,
                  quantity: item.quantity,
                  rate: item.rate,
                  discountType: item.discountType,
                  discountValue: item.discountValue,
                  total: item.total,
                  createdAt: createdAt,
                })) || [],
            },
            transactions: {
              create:
                transactions?.map((transaction) => ({
                  amount: transaction.amount,
                  mode: transaction.mode,
                  remarks: transaction.remarks,
                  receivedById: user.id,
                })) || [],
            },
            ipd: {
              create: {
                patientId: existingPatient.id,
                arrivalState: body.arrivalState,
                bedId: bed.id,
                careType: body.careType,
                remarks: body.remarks,
                consultantDoctorId: body.consultantDoctor.userId,
                referringDoctorId: body.referredDoctor?.userId,
                createdAt: createdAt,
              },
            },
          },
          include: { opd: true },
        });

        await tx.bed.update({
          where: { id: bed.id },
          data: { isOccupied: true, patientId: patientId },
        });

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
          message: "Ipd Created Successfully",
          data: invoice,
        });
      });
    },
  });
};

export const dischargePatientAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: partialIpdValidator,
    req,
    user,
    onSuccess: async ({ body, user }) => {
      return prisma.$transaction(async (tx) => {
        const { ipdId } = body;

        const existingIPD = await prisma.ipd.findFirst({
          where: { id: ipdId, isDischarged: false },
        });

        if (!existingIPD) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "IPD Not Found",
          });
        }

        await tx.bed.update({
          where: { id: existingIPD.bedId },
          data: { isOccupied: false },
        });

        await tx.ipd.update({
          where: { id: body.ipdId },
          data: { isDischarged: true },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Patient Discharged Successfully",
        });
      });
    },
  });
};
