import {
  AddressType,
  ContactType,
  DiscountType,
  IdentityType,
  Patient,
  Prisma,
  User,
} from "@/generated/prisma/client";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { hasUserPermission } from "@/lib/serverPermission";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { paginationValidator } from "@/validators/api/common/pagination";
import {
  ipdBedUpdateValidator,
  ipdBillingTypeUpdateValidator,
  ipdDateTimeUpdateValidator,
  ipdDoctorUpdateValidator,
  ipdMlcDeclareValidator,
  ipdValidator,
  partialIpdValidator,
} from "@/validators/api/ipd/ipd";

export const getAPI = async (req: Request, user: User) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const createdAtFrom = query["createdAt[from]"] ?? "";
      const createdAtTo = query["createdAt[to]"] ?? "";
      const mlcFrom = query["mlcDeclarationDate[from]"] ?? "";
      const mlcTo = query["mlcDeclarationDate[to]"] ?? "";
      const consultantDoctorId = query.consultantDoctorId
        ? Number(query.consultantDoctorId)
        : null;
      const referringDoctorId = query.referringDoctorId
        ? Number(query.referringDoctorId)
        : null;
      const isDischarged = query.isDischarged ?? "";
      const isMlcPatient = query.isMlcPatient ?? "";
      const isMlcView = isMlcPatient === true;

      const requestedIsDayCare =
        typeof query.isDayCare === "boolean" ? query.isDayCare : undefined;

      // Default behavior: normal IPDs only (unless explicitly requesting day care).
      // For MLC list, allow both IPD + Day Care when `isDayCare` isn't provided.
      const resolvedIsDayCare: boolean | undefined =
        typeof requestedIsDayCare === "boolean"
          ? requestedIsDayCare
          : isMlcView
            ? undefined
            : false;

      const moduleToCheck = isMlcView
        ? ModuleType.IPD_MLC
        : resolvedIsDayCare
          ? ModuleType.DAY_CARE_IPD
          : ModuleType.IPD_BILL;

      const canViewRequested = await hasUserPermission(
        user.id,
        moduleToCheck,
        ActionType.VIEW,
      );

      if (!canViewRequested) {
        return apiResponse({
          status: RESPONSE_STATUS.UNAUTHORIZED,
          message: "Not Allowed to permit the action",
        });
      }

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

      if (typeof resolvedIsDayCare === "boolean") {
        and.push({ isDayCare: resolvedIsDayCare });
      }

      if (typeof isMlcPatient === "boolean") {
        and.push({ isMlcPatient });
      }

      if (mlcFrom || mlcTo) {
        and.push({
          mlcDeclarationDate: {
            ...(mlcFrom && { gte: mlcFrom }),
            ...(mlcTo && { lte: mlcTo }),
          },
        });
      }

      if (createdAtFrom || createdAtTo) {
        if (isDischarged === true) {
          and.push({
            dischargedAt: {
              ...(createdAtFrom && { gte: createdAtFrom }),
              ...(createdAtTo && { lte: createdAtTo }),
            },
          });
        } else {
          and.push({
            createdAt: {
              ...(createdAtFrom && { gte: createdAtFrom }),
              ...(createdAtTo && { lte: createdAtTo }),
            },
          });
        }
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
            mlcDeclaredByUser: {
              select: {
                id: true,
                name: true,
              },
            },
            bed: {
              include: {
                room: {
                  include: {
                    roomType: {
                      include: {
                        department: true,
                      },
                    },
                  },
                },
              },
            },
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
                title: true,
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

export const getAdmissionPrintAPI = async (
  req: Request,
  { params }: { params: { ipdId: number } },
  user: User,
) => {
  return validateRequest({
    paramsSchema: partialIpdValidator,
    params,
    req,
    onSuccess: async ({ params }) => {
      const { ipdId } = params;

      return prisma.$transaction(async (tx) => {
        const ipd = await tx.ipd.findUnique({
          where: { id: ipdId },
          select: {
            id: true,
            ipdDateTime: true,
            arrivalState: true,
            isDischarged: true,
            isDayCare: true,
            remarks: true,
            patient: {
              select: {
                id: true,
                uhid: true,
                firstName: true,
                lastName: true,
                dob: true,
                gender: true,
                relations: true,
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
                  where: { type: AddressType.HOME },
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
            invoice: {
              select: {
                id: true,
                billingType: true,
              },
            },
            consultantDoctor: {
              select: { user: { select: { name: true } } },
            },
            referringDoctor: {
              select: { user: { select: { name: true } } },
            },
            bed: {
              select: {
                id: true,
                bedNumber: true,
                name: true,
                room: {
                  select: {
                    id: true,
                    name: true,
                    roomType: {
                      select: {
                        id: true,
                        name: true,
                        department: { select: { id: true, name: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        });

        if (!ipd) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Ipd not found",
          });
        }

        const canView = await hasUserPermission(
          user.id,
          ipd.isDayCare ? ModuleType.DAY_CARE_IPD : ModuleType.IPD_BILL,
          ActionType.VIEW,
        );

        if (!canView) {
          return apiResponse({
            status: RESPONSE_STATUS.UNAUTHORIZED,
            message: "Not Allowed to permit the action",
          });
        }

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Admission print fetched successfully",
          data: ipd,
        });
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
      const canCreate = await hasUserPermission(
        user.id,
        body.isDayCare ? ModuleType.DAY_CARE_IPD : ModuleType.IPD_BILL,
        ActionType.CREATE,
      );

      if (!canCreate) {
        return apiResponse({
          status: RESPONSE_STATUS.UNAUTHORIZED,
          message: "Not Allowed to permit the action",
        });
      }

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
            ipd: {
              create: {
                patientId: existingPatient.id,
                arrivalState: body.arrivalState,
                bedId: bed.id,
                careType: body.careType,
                isDayCare: body.isDayCare ?? false,
                remarks: body.remarks,
                consultantDoctorId: body.consultantDoctor.userId,
                referringDoctorId: body.referredDoctor?.userId,
                createdBy: user.id,
                updatedBy: user.id,
                ipdDateTime: createdAt,
              },
            },
          },
          include: { ipd: true },
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

        await tx.bed.update({
          where: { id: bed.id },
          data: { isOccupied: true, currentIpdId: invoice.ipd?.id },
        });

        const pathologyServices = await tx.pathologyTestService.findMany({
          where: {
            serviceId: { in: billingItems?.map((s) => s.service.id) },
          },
        });

        if (pathologyServices?.length) {
          await tx.pathologyTestOrder.createMany({
            data: pathologyServices.map((service) => ({
              ipdId: invoice.ipd!.id,
              patientId: invoice.ipd!.patientId,
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
              ipdId: invoice.ipd!.id,
              patientId: invoice.ipd!.patientId,
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
          data: {
            isDischarged: true,
            dischargedAt: new Date(),
            dischargedById: user.id,
            updatedBy: user.id,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Patient Discharged Successfully",
        });
      });
    },
  });
};

export const cancelDischargePatientAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: partialIpdValidator,
    req,
    user,
    onSuccess: async ({ body, user }) => {
      return prisma.$transaction(async (tx) => {
        const { ipdId } = body;

        const existingIPD = await tx.ipd.findFirst({
          where: { id: ipdId, isDischarged: true },
          select: { id: true, bedId: true },
        });

        if (!existingIPD) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "IPD Not Found",
          });
        }

        const bed = await tx.bed.findUnique({
          where: { id: existingIPD.bedId },
          select: { id: true, isOccupied: true, currentIpdId: true },
        });

        if (!bed) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Bed not found",
          });
        }

        if (bed.isOccupied && bed.currentIpdId !== existingIPD.id) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Bed is already occupied",
          });
        }

        await tx.bed.update({
          where: { id: bed.id },
          data: { isOccupied: true, currentIpdId: existingIPD.id },
        });

        await tx.ipd.update({
          where: { id: existingIPD.id },
          data: {
            isDischarged: false,
            dischargedAt: null,
            dischargedById: null,
            updatedBy: user.id,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Discharge cancelled successfully",
        });
      });
    },
  });
};

export const updateIpdDoctorsAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: ipdDoctorUpdateValidator,
    req,
    onSuccess: async ({ body }) => {
      const { ipdId, consultantDoctor, referredDoctor } = body;

      return prisma.$transaction(async (tx) => {
        const existingIpd = await tx.ipd.findUnique({
          where: { id: ipdId },
          select: { id: true, isDayCare: true },
        });

        if (!existingIpd) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Ipd not found",
          });
        }

        const canUpdate = await hasUserPermission(
          user.id,
          existingIpd.isDayCare ? ModuleType.DAY_CARE_IPD : ModuleType.IPD_BILL,
          ActionType.UPDATE,
        );

        if (!canUpdate) {
          return apiResponse({
            status: RESPONSE_STATUS.UNAUTHORIZED,
            message: "Not Allowed to permit the action",
          });
        }

        if (consultantDoctor?.userId) {
          const exists = await tx.doctor.findUnique({
            where: { userId: consultantDoctor.userId },
            select: { userId: true },
          });
          if (!exists) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "Consultant doctor not found",
            });
          }
        }

        if (referredDoctor?.userId) {
          const exists = await tx.doctor.findUnique({
            where: { userId: referredDoctor.userId },
            select: { userId: true },
          });
          if (!exists) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "Referring doctor not found",
            });
          }
        }

        const updated = await tx.ipd.update({
          where: { id: ipdId },
          data: {
            ...(consultantDoctor?.userId
              ? { consultantDoctorId: consultantDoctor.userId }
              : {}),
            ...(referredDoctor === null
              ? { referringDoctorId: null }
              : referredDoctor?.userId
                ? { referringDoctorId: referredDoctor.userId }
                : {}),
            updatedBy: user.id,
          },
          select: {
            id: true,
            consultantDoctor: {
              select: { user: { select: { id: true, name: true } } },
            },
            referringDoctor: {
              select: { user: { select: { id: true, name: true } } },
            },
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "IPD doctors updated successfully",
          data: updated,
        });
      });
    },
  });
};

export const updateIpdBillingTypeAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: ipdBillingTypeUpdateValidator,
    req,
    onSuccess: async ({ body }) => {
      const { ipdId, billingType } = body;

      return prisma.$transaction(async (tx) => {
        const existingIpd = await tx.ipd.findUnique({
          where: { id: ipdId },
          select: { id: true, invoiceId: true, isDayCare: true },
        });

        if (!existingIpd) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Ipd not found",
          });
        }

        const canUpdate = await hasUserPermission(
          user.id,
          existingIpd.isDayCare ? ModuleType.DAY_CARE_IPD : ModuleType.IPD_BILL,
          ActionType.UPDATE,
        );

        if (!canUpdate) {
          return apiResponse({
            status: RESPONSE_STATUS.UNAUTHORIZED,
            message: "Not Allowed to permit the action",
          });
        }

        const updatedInvoice = await tx.invoice.update({
          where: { id: existingIpd.invoiceId },
          data: { billingType, updatedBy: user.id },
          select: { id: true, billingType: true },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Billing type updated successfully",
          data: updatedInvoice,
        });
      });
    },
  });
};

export const updateIpdBedAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: ipdBedUpdateValidator,
    req,
    onSuccess: async ({ body }) => {
      const { ipdId, bedId } = body;

      return prisma.$transaction(async (tx) => {
        const existingIpd = await tx.ipd.findUnique({
          where: { id: ipdId },
          select: { id: true, bedId: true, isDischarged: true, isDayCare: true },
        });

        if (!existingIpd) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Ipd not found",
          });
        }

        const canUpdate = await hasUserPermission(
          user.id,
          existingIpd.isDayCare ? ModuleType.DAY_CARE_IPD : ModuleType.IPD_BILL,
          ActionType.UPDATE,
        );

        if (!canUpdate) {
          return apiResponse({
            status: RESPONSE_STATUS.UNAUTHORIZED,
            message: "Not Allowed to permit the action",
          });
        }

        if (existingIpd.isDischarged) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Cannot change bed for discharged IPD",
          });
        }

        const newBed = await tx.bed.findFirst({
          where: { id: bedId, isDeleted: false },
          select: { id: true, isOccupied: true },
        });

        if (!newBed) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Bed not found",
          });
        }

        if (newBed.isOccupied) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Bed is already occupied",
          });
        }

        if (existingIpd.bedId !== bedId) {
          await tx.bed.update({
            where: { id: existingIpd.bedId },
            data: { isOccupied: false, currentIpdId: null },
          });

          await tx.bed.update({
            where: { id: bedId },
            data: { isOccupied: true, currentIpdId: existingIpd.id },
          });

          await tx.ipd.update({
            where: { id: existingIpd.id },
            data: { bedId, updatedBy: user.id },
          });
        }

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Bed reallocated successfully",
        });
      });
    },
  });
};

export const updateIpdDateTimeAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: ipdDateTimeUpdateValidator,
    req,
    onSuccess: async ({ body }) => {
      const { ipdId, ipdDateTime } = body;

      return prisma.$transaction(async (tx) => {
        const existingIpd = await tx.ipd.findUnique({
          where: { id: ipdId },
          select: { id: true, invoiceId: true, isDayCare: true },
        });

        if (!existingIpd) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Ipd not found",
          });
        }

        const canUpdate = await hasUserPermission(
          user.id,
          existingIpd.isDayCare ? ModuleType.DAY_CARE_IPD : ModuleType.IPD_BILL,
          ActionType.UPDATE,
        );

        if (!canUpdate) {
          return apiResponse({
            status: RESPONSE_STATUS.UNAUTHORIZED,
            message: "Not Allowed to permit the action",
          });
        }

        await tx.ipd.update({
          where: { id: existingIpd.id },
          data: { ipdDateTime, updatedBy: user.id },
        });

        await tx.invoice.update({
          where: { id: existingIpd.invoiceId },
          data: { createdAt: ipdDateTime, updatedBy: user.id },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "IPD date/time updated successfully",
        });
      });
    },
  });
};

export const declareIpdMlcAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: ipdMlcDeclareValidator,
    req,
    onSuccess: async ({ body }) => {
      const { ipdId } = body;

      return prisma.$transaction(async (tx) => {
        const existingIpd = await tx.ipd.findUnique({
          where: { id: ipdId },
          select: { id: true, isDayCare: true, isMlcPatient: true },
        });

        if (!existingIpd) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Ipd not found",
          });
        }

        const canUpdate = await hasUserPermission(
          user.id,
          ModuleType.IPD_MLC,
          ActionType.UPDATE,
        );

        if (!canUpdate) {
          return apiResponse({
            status: RESPONSE_STATUS.UNAUTHORIZED,
            message: "Not Allowed to permit the action",
          });
        }

        if (existingIpd.isMlcPatient) {
          return apiResponse({
            status: RESPONSE_STATUS.SUCCESS,
            message: "Patient already marked as MLC",
          });
        }

        await tx.ipd.update({
          where: { id: ipdId },
          data: {
            isMlcPatient: true,
            mlcDeclaredById: user.id,
            mlcDeclarationDate: new Date(),
            updatedBy: user.id,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Patient marked as MLC successfully",
        });
      });
    },
  });
};
