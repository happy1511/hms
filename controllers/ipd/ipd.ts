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
import { getInvoiceDueAmount } from "@/lib/invoiceTransactions";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { hasUserPermission } from "@/lib/serverPermission";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { syncIpdLockedBillingItems } from "@/lib/ipdBilling";
import { getPatientUhid } from "@/controllers/patient/patient";
import { paginationValidator } from "@/validators/api/common/pagination";
import {
  ipdBedUpdateValidator,
  ipdBillingTypeUpdateValidator,
  ipdDateTimeUpdateValidator,
  ipdDoctorUpdateValidator,
  ipdDischargeSummaryValidator,
  ipdMlcDeclareValidator,
  ipdValidator,
  partialIpdValidator,
} from "@/validators/api/ipd/ipd";
import { isSameDay } from "date-fns";

const getIpdDeleteErrorResponse = () =>
  apiResponse({
    status: RESPONSE_STATUS.BAD_REQUEST,
    message: "IPD can only be deleted on the same day it was created",
  });

const getPatientAlreadyAdmittedResponse = (activeIpd: {
  id: number;
  isDayCare: boolean;
}) =>
  apiResponse({
    status: RESPONSE_STATUS.BAD_REQUEST,
    message: `Patient is already admitted in ${activeIpd.isDayCare ? "Day Care" : "IPD"} #${activeIpd.id} and has not been discharged yet`,
  });

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

      if (mlcFrom || mlcTo) {
        and.push({
          patient: {
            is: {
              updatedAt: {
                ...(mlcFrom && { gte: mlcFrom }),
                ...(mlcTo && { lte: mlcTo }),
              },
            },
          },
        });
      }

      if (typeof isMlcPatient === "boolean") {
        and.push({
          patient: {
            is: {
              isMlcPatient,
            },
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

      and.push({ isDeleted: false });

      const where: Prisma.IpdWhereInput = and.length ? { AND: and } : {};

      const [items, total] = await prisma.$transaction([
        prisma.ipd.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
          include: {
            invoice: {
              include: {
                transactions: {
                  include: { receivedBy: { select: { name: true } } },
                },
              },
            },
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
                isMlcPatient: true,
                mlcInsuranceType: true,
                mlcPolicyOrCardNumber: true,
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
          where: { id: ipdId, isDeleted: false },
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
                        postName: true,
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

export const getIpdDischargeSummaryAPI = async (
  req: Request,
  { params }: { params: { ipdId: number } },
  user: User,
) => {
  return validateRequest({
    paramsSchema: partialIpdValidator,
    params,
    req,
    user,
    onSuccess: async ({ params }) => {
      const { ipdId } = params;

      return prisma.$transaction(async (tx) => {
        const ipd = await tx.ipd.findUnique({
          where: { id: ipdId, isDeleted: false },
          select: {
            id: true,
            ipdDateTime: true,
            invoice: {
              select: {
                total: true,
                transactions: {
                  select: {
                    amount: true,
                    transactionType: true,
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

        const summary = await tx.ipdDischargeSummary.findUnique({
          where: { ipdId },
          include: {
            drugs: { orderBy: { id: "asc" }, include: { drug: true } },
          },
        });

        if (!summary) {
          return apiResponse({
            status: RESPONSE_STATUS.SUCCESS,
            message: "Discharge summary fetched successfully",
            data: {
              ipdId,
              ipdDateTime: ipd.ipdDateTime,
              dueAmount: getInvoiceDueAmount({
                total: Number(ipd.invoice?.total || 0),
                transactions: ipd.invoice?.transactions || [],
              }),
              drugs: [],
            },
          });
        }

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Discharge summary fetched successfully",
          data: {
            ...summary,
            dueAmount: getInvoiceDueAmount({
              total: Number(ipd.invoice?.total || 0),
              transactions: ipd.invoice?.transactions || [],
            }),
          },
        });
      });
    },
  });
};

export const upsertIpdDischargeSummaryAPI = async (
  req: Request,
  user: User,
) => {
  return validateRequest({
    bodySchema: ipdDischargeSummaryValidator,
    req,
    user,
    onSuccess: async ({ body }) => {
      const { ipdId, drugs = [], ...fields } = body;

      return prisma.$transaction(async (tx) => {
        const ipd = await tx.ipd.findUnique({
          where: { id: ipdId, isDeleted: false },
          select: { id: true },
        });

        if (!ipd) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Ipd not found",
          });
        }

        const upserted = await tx.ipdDischargeSummary.upsert({
          where: { ipdId },
          update: {
            ...fields,
          },
          create: {
            ipdId,
            ...fields,
          },
        });

        await tx.ipdDischargeDrug.deleteMany({
          where: { dischargeSummaryId: upserted.id },
        });

        if (drugs?.length) {
          await tx.ipdDischargeDrug.createMany({
            data: drugs.map((drug) => ({
              dischargeSummaryId: upserted.id,
              drugId: Number((drug as any).drugId),
              frequency: drug.frequency,
              days: drug.days,
              unit: drug.unit || null,
              route: drug.route,
              remarks: drug.remarks || null,
            })),
          });
        }

        const summary = await tx.ipdDischargeSummary.findUnique({
          where: { ipdId },
          include: {
            drugs: { orderBy: { id: "asc" }, include: { drug: true } },
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Discharge summary saved successfully",
          data: summary,
        });
      });
    },
  });
};

export const getIpdDischargePrintAPI = async (
  req: Request,
  { params }: { params: { ipdId: number } },
  user: User,
) => {
  return validateRequest({
    paramsSchema: partialIpdValidator,
    params,
    req,
    user,
    onSuccess: async ({ params }) => {
      const { ipdId } = params;

      return prisma.$transaction(async (tx) => {
        const ipd = await tx.ipd.findUnique({
          where: { id: ipdId, isDeleted: false },
          select: {
            id: true,
            ipdDateTime: true,
            dischargedAt: true,
            isDischarged: true,
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
                        postName: true,
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
            dischargeSummary: {
              include: {
                drugs: { orderBy: { id: "asc" }, include: { drug: true } },
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

        if (!ipd.dischargeSummary) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Discharge summary not found",
          });
        }

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Discharge print fetched successfully",
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

        const existingBed = await tx.bed.findFirst({
          where: { id: bed.id, isOccupied: false, isDeleted: false },
          include: {
            room: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
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
            const activeIpd = await tx.ipd.findFirst({
              where: {
                patientId: existingPatient.id,
                isDeleted: false,
                isDischarged: false,
              },
              select: {
                id: true,
                isDayCare: true,
              },
            });

            if (activeIpd) {
              return getPatientAlreadyAdmittedResponse(activeIpd);
            }

            const {
              contacts = [],
              addresses = [],
              relations = [],
              identifications = [],
              emergencyContacts: _emergencyContacts,
              notes: _notes,
              mlcPolicyOrCardNumber,
              ...patientRest
            } = patient;

            await tx.patient.update({
              where: { id: existingPatient.id },
              data: {
                ...patientRest,
                mlcPolicyOrCardNumber: mlcPolicyOrCardNumber?.trim() ?? null,
                mlcInsuranceType: patientRest.mlcInsuranceType ?? null,
                updatedBy: user.id,
              },
            });

            const relation = relations.splice(0, 1);
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

            const homeAddress = addresses.find((a) => a.type === AddressType.HOME);

            if (homeAddress) {
              const locationId = homeAddress.location?.id;
              const addressLineOne = homeAddress.addressLineOne?.trim();

              if (!locationId || !addressLineOne) {
                // Address is optional in billing forms
              } else {
                await tx.patientAddress.upsert({
                  where: {
                    type_patientId: {
                      patientId: existingPatient.id,
                      type: AddressType.HOME,
                    },
                  },
                  create: {
                    type: homeAddress.type,
                    addressLineOne,
                    addressLineTwo: homeAddress.addressLineTwo ?? null,
                    addressLineThree: homeAddress.addressLineThree ?? null,
                    locationId,
                    patientId: existingPatient.id,
                  },
                  update: {
                    type: homeAddress.type,
                    addressLineOne,
                    addressLineTwo: homeAddress.addressLineTwo ?? null,
                    addressLineThree: homeAddress.addressLineThree ?? null,
                    locationId,
                  },
                });
              }
            }

            const contactsToUpsert = contacts
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

            const documentToUpsert = identifications
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
            mlcPolicyOrCardNumber,
            ageYears,
            ...rest
          } = patient;
          void ageYears;
          existingPatient = await tx.patient.create({
            data: {
              ...rest,
              uhid: `PENDING_${crypto.randomUUID()}`,
              mlcInsuranceType: rest.mlcInsuranceType ?? null,
              mlcPolicyOrCardNumber: mlcPolicyOrCardNumber?.trim() ?? null,
              contacts: {
                create: contacts
                  .filter((c) => Boolean(c.value?.trim()))
                  .map((c) => ({
                    type: c.type,
                    value: String(c.value).trim(),
                  })),
              },
              addresses: {
                create: addresses
                  .filter(
                    (l) =>
                      Boolean(l.addressLineOne?.trim()) &&
                      Boolean(l.location?.id),
                  )
                  .map((l) => ({
                    addressLineOne: String(l.addressLineOne).trim(),
                    addressLineThree: l.addressLineThree ?? null,
                    addressLineTwo: l.addressLineTwo ?? null,
                    locationId: l.location!.id,
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
          existingPatient = await tx.patient.update({
            where: { id: existingPatient.id },
            data: {
              uhid: getPatientUhid(
                existingPatient.id,
                existingPatient.createdAt,
              ),
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
                consultantDoctorId: body.consultantDoctor.id,
                referringDoctorId: body.referredDoctor?.id,
                createdBy: user.id,
                updatedBy: user.id,
                ipdDateTime: createdAt,
                roomId: existingBed.room.id,
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
            data: sectionItems
              .filter((item) => item.service?.id)
              .map((item) => ({
                invoiceId: invoice.id,
                invoiceBillingSectionId: invoiceBillingSection.id,
                billingSectionId: item.billingSection.id,
                serviceId: item.service!.id,
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

        await tx.ipdBedAllocation.create({
          data: {
            ipdId: invoice.ipd!.id,
            bedId: bed.id,
            roomId: existingBed.room.id,
            fromDateTime: createdAt,
          },
        });

        const pathologyServices = await tx.pathologyTestService.findMany({
          where: {
            serviceId: {
              in:
                billingItems
                  ?.filter((s) => s.service?.id)
                  .map((s) => s.service!.id) || [],
            },
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
            serviceId: {
              in:
                billingItems
                  ?.filter((s) => s.service?.id)
                  .map((s) => s.service!.id) || [],
            },
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

        await syncIpdLockedBillingItems(tx, {
          ipdId: invoice.ipd!.id,
          actingUserId: user.id,
          now: createdAt,
        });

        return apiResponse({
          status: RESPONSE_STATUS.CREATED,
          message: "Ipd Created Successfully",
          data: invoice,
        });
      });
    },
  });
};

export const deleteAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: partialIpdValidator,
    req,
    onSuccess: async ({ body }) => {
      return prisma.$transaction(async (tx) => {
        const existingIpd = await tx.ipd.findFirst({
          where: { id: body.ipdId, isDeleted: false },
          select: {
            id: true,
            invoiceId: true,
            bedId: true,
            createdAt: true,
            isDayCare: true,
          },
        });

        if (!existingIpd) {
          return apiResponse({
            status: RESPONSE_STATUS.NOT_FOUND,
            message: "Ipd not found",
          });
        }

        const canDelete = await hasUserPermission(
          user.id,
          existingIpd.isDayCare ? ModuleType.DAY_CARE_IPD : ModuleType.IPD_BILL,
          ActionType.DELETE,
        );

        if (!canDelete) {
          return apiResponse({
            status: RESPONSE_STATUS.UNAUTHORIZED,
            message: "Not Allowed to permit the action",
          });
        }

        if (!isSameDay(existingIpd.createdAt, new Date())) {
          return getIpdDeleteErrorResponse();
        }

        await tx.transaction.updateMany({
          where: { invoiceId: existingIpd.invoiceId, isDeleted: false },
          data: { isDeleted: true },
        });

        await tx.pathologyTestOrder.updateMany({
          where: { ipdId: existingIpd.id, isDeleted: false },
          data: { isDeleted: true },
        });

        await tx.radiologyTestOrder.updateMany({
          where: { ipdId: existingIpd.id, isDeleted: false },
          data: { isDeleted: true },
        });

        await tx.ipdBedAllocation.updateMany({
          where: { ipdId: existingIpd.id, toDateTime: null },
          data: { toDateTime: new Date() },
        });

        await tx.bed.update({
          where: { id: existingIpd.bedId },
          data: { isOccupied: false, currentIpdId: null },
        });

        await tx.invoice.update({
          where: { id: existingIpd.invoiceId },
          data: {
            isDeleted: true,
            deletedBy: user.id,
            updatedBy: user.id,
          },
        });

        const deletedIpd = await tx.ipd.update({
          where: { id: existingIpd.id },
          data: {
            isDeleted: true,
            deletedBy: user.id,
            updatedBy: user.id,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Ipd Deleted Successfully",
          data: deletedIpd,
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

        const existingIPD = await tx.ipd.findFirst({
          where: { id: ipdId, isDischarged: false, isDeleted: false },
        });

        if (!existingIPD) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "IPD Not Found",
          });
        }

        const dischargedAt = new Date();

        await tx.bed.update({
          where: { id: existingIPD.bedId },
          data: { isOccupied: false },
        });

        await tx.ipdBedAllocation.updateMany({
          where: {
            ipdId,
            toDateTime: null,
          },
          data: {
            toDateTime: dischargedAt,
          },
        });

        await tx.ipd.update({
          where: { id: body.ipdId },
          data: {
            isDischarged: true,
            dischargedAt,
            dischargedById: user.id,
            updatedBy: user.id,
          },
        });

        await syncIpdLockedBillingItems(tx, {
          ipdId,
          actingUserId: user.id,
          now: dischargedAt,
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
          where: { id: ipdId, isDischarged: true, isDeleted: false },
          select: { id: true, bedId: true, ipdDateTime: true },
        });

        if (!existingIPD) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "IPD Not Found",
          });
        }

        if (!isSameDay(existingIPD.ipdDateTime, new Date())) {
          return apiResponse({
            status: RESPONSE_STATUS.BAD_REQUEST,
            message: "Discharge can only be cancelled for same day IPD",
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

        const latestAllocation = await tx.ipdBedAllocation.findFirst({
          where: { ipdId },
          orderBy: { fromDateTime: "desc" },
          select: { id: true },
        });

        if (latestAllocation) {
          await tx.ipdBedAllocation.update({
            where: { id: latestAllocation.id },
            data: {
              toDateTime: null,
            },
          });
        }

        await syncIpdLockedBillingItems(tx, {
          ipdId,
          actingUserId: user.id,
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
          where: { id: ipdId, isDeleted: false },
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

        if (consultantDoctor?.id) {
          const exists = await tx.doctor.findUnique({
            where: { id: consultantDoctor.id },
            select: { id: true },
          });
          if (!exists) {
            return apiResponse({
              status: RESPONSE_STATUS.BAD_REQUEST,
              message: "Consultant doctor not found",
            });
          }
        }

        if (referredDoctor?.id) {
          const exists = await tx.doctor.findUnique({
            where: { id: referredDoctor.id },
            select: { id: true },
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
            ...(consultantDoctor?.id
              ? { consultantDoctorId: consultantDoctor.id }
              : {}),
            ...(referredDoctor === null
              ? { referringDoctorId: null }
              : referredDoctor?.id
                ? { referringDoctorId: referredDoctor.id }
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

        await syncIpdLockedBillingItems(tx, {
          ipdId,
          actingUserId: user.id,
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
          where: { id: ipdId, isDeleted: false },
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
          where: { id: ipdId, isDeleted: false },
          select: {
            id: true,
            bedId: true,
            ipdDateTime: true,
            isDischarged: true,
            isDayCare: true,
            bed: {
              select: {
                roomId: true,
              },
            },
          },
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
          select: { id: true, isOccupied: true, roomId: true },
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
          const reallocatedAt = new Date();

          await tx.ipdBedAllocation.updateMany({
            where: {
              ipdId,
              toDateTime: null,
            },
            data: {
              toDateTime: reallocatedAt,
            },
          });

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
            data: { bedId, roomId: newBed.roomId, updatedBy: user.id },
          });

          await tx.ipdBedAllocation.create({
            data: {
              ipdId,
              bedId,
              roomId: newBed.roomId,
              fromDateTime: reallocatedAt,
            },
          });

          await syncIpdLockedBillingItems(tx, {
            ipdId,
            actingUserId: user.id,
            now: reallocatedAt,
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
          where: { id: ipdId, isDeleted: false },
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

        const firstAllocation = await tx.ipdBedAllocation.findFirst({
          where: { ipdId },
          orderBy: { fromDateTime: "asc" },
          select: { id: true },
        });

        if (firstAllocation) {
          await tx.ipdBedAllocation.update({
            where: { id: firstAllocation.id },
            data: { fromDateTime: ipdDateTime },
          });
        }

        await syncIpdLockedBillingItems(tx, {
          ipdId,
          actingUserId: user.id,
          now: ipdDateTime,
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
      const {
        ipdId,
        isMlcPatient = true,
        mlcInsuranceType = null,
        mlcPolicyOrCardNumber = null,
      } = body;

      return prisma.$transaction(async (tx) => {
        const existingIpd = await tx.ipd.findUnique({
          where: { id: ipdId, isDeleted: false },
          select: {
            id: true,
            isDayCare: true,
            isMlcPatient: true,
            patientId: true,
            patient: {
              select: {
                id: true,
                isMlcPatient: true,
              },
            },
          },
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

        await tx.patient.update({
          where: { id: existingIpd.patientId },
          data: {
            updatedBy: user.id,
            isMlcPatient,
            mlcInsuranceType: mlcInsuranceType ?? null,
            mlcPolicyOrCardNumber: mlcPolicyOrCardNumber?.trim() ?? null,
          },
        });

        return apiResponse({
          status: RESPONSE_STATUS.SUCCESS,
          message: "Patient MLC details updated successfully",
        });
      });
    },
  });
};
