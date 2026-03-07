import { ContactType, Prisma, User } from "@/generated/prisma/client";
import { apiResponse } from "@/lib/apiResponse";
import { RESPONSE_STATUS } from "@/lib/responseStatus";
import { validateRequest } from "@/lib/validator";
import { prisma } from "@/services/prisma";
import { paginationValidator } from "@/validators/api/common/pagination";
import {
  identificationsValidator,
  partialPatientValidator,
  patientValidator,
} from "@/validators/api/masters/patient";

export const getAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const search = query.search ?? "";
      const contactNo = query.contactNo ?? "";
      const uhid = query.uhid ?? "";
      const createdAtFrom = query["createdAt[from]"] ?? "";
      const createdAtTo = query["createdAt[to]"] ?? "";

      const skip = (page - 1) * limit;
      const and: Prisma.PatientWhereInput[] = [];

      if (search) {
        and.push(
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { middleName: { contains: search } },
        );
      }

      if (uhid) {
        and.push({ uhid: { equals: uhid } });
      }

      if (contactNo) {
        and.push({
          contacts: {
            some: {
              OR: [
                {
                  type: ContactType.MOBILE,
                  value: { equals: contactNo },
                },
                {
                  type: ContactType.PHONE,
                  value: { equals: contactNo },
                },
              ],
            },
          },
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

      const where: Prisma.PatientWhereInput = and.length ? { AND: and } : {};

      const [items, total] = await prisma.$transaction([
        prisma.patient.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
          select: {
            firstName: true,
            lastName: true,
            middleName: true,
            uhid: true,
            id: true,

            contacts: {
              where: {
                OR: [{ type: ContactType.MOBILE }, { type: ContactType.PHONE }],
              },
              select: {
                type: true,
                value: true,
                id: true,
              },
            },
          },
        }),
        prisma.patient.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Patient Fetched Successfully",
        data: items,
        total,
      });
    },
  });
};

export const getDocumentsAPI = async (req: Request) => {
  return validateRequest({
    querySchema: paginationValidator,
    req,
    onSuccess: async ({ query }) => {
      const page = Number(query.page ?? 1);
      const limit = Number(query.limit ?? 10);
      const search = query.search ?? "";
      const contactNo = query.contactNo ?? "";
      const uhid = query.uhid ?? "";
      const documentType = query.documentType ?? "";
      const createdAtFrom = query["createdAt[from]"] ?? "";
      const createdAtTo = query["createdAt[to]"] ?? "";

      const skip = (page - 1) * limit;
      const and: Prisma.PatientIdentificationWhereInput[] = [];

      if (search) {
        and.push({
          patient: {
            firstName: { contains: search },
            lastName: { contains: search },
            middleName: { contains: search },
          },
        });
      }

      if (uhid) {
        and.push({ patient: { uhid: { equals: uhid } } });
      }

      if (contactNo) {
        and.push({
          patient: {
            contacts: {
              some: {
                OR: [
                  {
                    type: ContactType.MOBILE,
                    value: { equals: contactNo },
                  },
                  {
                    type: ContactType.PHONE,
                    value: { equals: contactNo },
                  },
                ],
              },
            },
          },
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

      if (documentType) {
        and.push({
          type: { equals: documentType },
        });
      }

      const where: Prisma.PatientIdentificationWhereInput = and.length
        ? { AND: and }
        : {};

      const [items, total] = await prisma.$transaction([
        prisma.patientIdentification.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          where,
          select: {
            id: true,
            type: true,
            number: true,
            patient: {
              select: {
                firstName: true,
                lastName: true,
                middleName: true,
                uhid: true,
                id: true,
              },
            },
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.patientIdentification.count({ where }),
      ]);

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Documents Fetched Successfully",
        data: items,
        total,
      });
    },
  });
};

export const createDocumentAPI = async (req: Request) => {
  return validateRequest({
    bodySchema: identificationsValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      const patient = await prisma.patientIdentification.create({
        data: {
          ...data,
        },
      });

      return apiResponse({
        status: RESPONSE_STATUS.CREATED,
        message: "Document Created Successfully",
        data: patient,
      });
    },
  });
};

export const getDetailsAPI = async (
  req: Request,
  { params }: { params: { patientId: string } },
) => {
  return validateRequest({
    paramsSchema: partialPatientValidator,
    req,
    params,
    onSuccess: async ({ params }) => {
      const id = params.patientId;

      const patient = await prisma.patient.findUnique({
        where: { id: id },
        select: {
          id: true,
          uhid: true,
          firstName: true,
          middleName: true,
          lastName: true,
          preferredName: true,
          dob: true,
          identificationMark: true,
          gender: true,
          maritalStatus: true,
          religion: true,
          bloodGroup: true,
          relations: true,
          contacts: true,
          title: true,
          addresses: { include: { location: true } },
          identifications: true,
          emergencyContacts: true,
        },
      });

      if (!patient) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Patient not found",
        });
      }

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Patient Fetched Successfully",
        data: patient,
      });
    },
  });
};

export const createAPI = async (req: Request, user: User) => {
  return validateRequest({
    bodySchema: patientValidator,
    req,
    onSuccess: async ({ body }) => {
      const data = body;

      const {
        contacts,
        emergencyContacts,
        relations,
        addresses,
        identifications,
        notes,
        ...rest
      } = data;

      const patient = await prisma.patient.create({
        data: {
          ...rest,
          createdBy: user.id ,
          updatedBy: user.id ,
          contacts: {
            create: contacts,
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
        include: {
          contacts: true,
          addresses: true,
          relations: true,
          identifications: true,
          emergencyContacts: true,
          notes: true,
        },
      });

      return apiResponse({
        status: RESPONSE_STATUS.CREATED,
        message: "Doctor Created Successfully",
        data: patient,
      });
    },
  });
};

export const updateAPI = async (
  req: Request,
  { params }: { params: { patientId: string } },
  user: User,
) => {
  return validateRequest({
    bodySchema: partialPatientValidator,
    paramsSchema: partialPatientValidator,
    params,
    req,
    onSuccess: async ({ body }) => {
      const data = body;
      const existingUser = await prisma.patient.findUnique({
        where: { id: data.patientId },
      });

      if (!existingUser) {
        return apiResponse({
          status: RESPONSE_STATUS.NOT_FOUND,
          message: "Patient not found",
        });
      }

      const {
        contacts,
        emergencyContacts,
        relations,
        addresses,
        identifications,
        notes,
        patientId,
        ...rest
      } = data;

      const updatedPatient = await prisma.patient.update({
        where: { id: data.patientId },
        data: {
          ...rest,
          updatedBy: user.id ,

          addresses: addresses
            ? {
                deleteMany: {
                  id: {
                    notIn: addresses
                      .map((a) => a.location.id)
                      .filter(Boolean) as number[],
                  },
                },
                upsert: addresses.map(({ id, location, ...rest }) => ({
                  where: { id: id ?? 0 },
                  create: { ...rest, locationId: location.id },
                  update: { ...rest, locationId: location.id },
                })),
              }
            : undefined,

          contacts: contacts
            ? {
                deleteMany: {
                  id: {
                    notIn: contacts
                      .map((c) => c.id)
                      .filter(Boolean) as number[],
                  },
                },
                upsert: contacts.map(({ id, ...rest }) => ({
                  where: { id: id ?? 0 },
                  create: rest,
                  update: rest,
                })),
              }
            : undefined,

          identifications: identifications
            ? {
                deleteMany: {
                  id: {
                    notIn: identifications
                      .map((i) => i.id)
                      .filter(Boolean) as number[],
                  },
                },
                upsert: identifications.map(({ id, ...rest }) => ({
                  where: { id: id ?? 0 },
                  create: rest,
                  update: rest,
                })),
              }
            : undefined,

          emergencyContacts: emergencyContacts
            ? {
                deleteMany: {
                  id: {
                    notIn: emergencyContacts
                      .map((e) => e.id)
                      .filter(Boolean) as number[],
                  },
                },
                upsert: emergencyContacts.map(({ id, ...rest }) => ({
                  where: { id: id ?? 0 },
                  create: rest,
                  update: rest,
                })),
              }
            : undefined,

          relations: relations
            ? {
                deleteMany: {
                  id: {
                    notIn: relations
                      .map((r) => r.id)
                      .filter(Boolean) as number[],
                  },
                },
                upsert: relations.map(({ id, ...rest }) => ({
                  where: { id: id ?? 0 },
                  create: rest,
                  update: rest,
                })),
              }
            : undefined,

          notes: notes
            ? {
                deleteMany: {
                  id: {
                    notIn: notes.map((n) => n.id).filter(Boolean) as number[],
                  },
                },
                upsert: notes.map(({ id, ...rest }) => ({
                  where: { id: id ?? 0 },
                  create: rest,
                  update: rest,
                })),
              }
            : undefined,
        },
        include: {
          addresses: true,
          contacts: true,
          relations: true,
          identifications: true,
          emergencyContacts: true,
          notes: true,
        },
      });

      return apiResponse({
        status: RESPONSE_STATUS.SUCCESS,
        message: "Patient Updated Successfully",
        data: updatedPatient,
      });
    },
  });
};

