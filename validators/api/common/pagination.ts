import {
  AppointmentStatus,
  DoctorType,
  PathologyOrderStatus,
  PathologyTestSection,
  RadiologyOrderStatus,
  RadiologySection,
  Status,
} from "@/generated/prisma/enums";
import { z } from "zod";

const paginationValidator = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(Status).optional(),
  nonOccupied: z
    .string()
    .optional()
    .transform((t) => (t === "true" ? true : false)),
  isDischarged: z
    .string()
    .optional()
    .transform((t) => (t === "true" ? true : false)),
  isDayCare: z
    .string()
    .optional()
    .transform((t) => (t === "true" ? true : false)),
  testStatus: z.array(z.enum(PathologyOrderStatus)).optional(),
  radiologyStatus: z.array(z.enum(RadiologyOrderStatus)).optional(),
  cancelled: z
    .string()
    .transform((t) => (t === "true" ? true : false))
    .optional(),
  outsourced: z
    .string()
    .transform((t) => (t === "true" ? true : false))
    .optional(),
  appointmentStatus: z.enum(AppointmentStatus).optional(),
  doctorType: z.enum(DoctorType).optional(),
  uhid: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .transform((t) => (t ? Number(t) : undefined)),
  contactNo: z.string().optional(),
  roomId: z.coerce
    .number()
    .min(1)
    .optional()
    .transform((t) => Number(t)),
  roomTypeId: z.coerce
    .number()
    .min(1)
    .optional()
    .transform((t) => Number(t)),
  departmentId: z.coerce
    .number()
    .min(1)
    .optional()
    .transform((t) => Number(t)),
  doctorId: z.coerce
    .number()
    .min(1)
    .optional()
    .transform((t) => Number(t)),
  billingSectionId: z.coerce
    .number()
    .min(1)
    .optional()
    .transform((t) => Number(t)),
  documentType: z.string().optional(),
  pathologyTestType: z.enum(PathologyTestSection).optional(),
  radiologyTestType: z.enum(RadiologySection).optional(),
  pathologyTestId: z.coerce
    .number()
    .optional()
    .transform((t) => Number(t)),
  defaultSelectedIds: z.array(z.coerce.number()).optional(),
  transactionType: z.enum(["opd", "ipd"]).optional(),
  opdId: z.coerce
    .number()
    .optional()
    .transform((t) => Number(t)),
  ipdId: z.coerce
    .number()
    .optional()
    .transform((t) => Number(t)),
  consultantDoctorId: z.coerce
    .number()
    .optional()
    .transform((id) => Number(id)),
  referringDoctorId: z.coerce
    .number()
    .optional()
    .transform((id) => Number(id)),
  supplierId: z.coerce
    .number()
    .min(1)
    .optional()
    .transform((id) => Number(id)),
  drugId: z.coerce
    .number()
    .min(1)
    .optional()
    .transform((id) => Number(id)),
  includeZeroStock: z
    .string()
    .optional()
    .transform((t) => (t === "true" ? true : false)),
  withoutGrn: z
    .string()
    .optional()
    .transform((t) => (t === "true" ? true : false)),
  isMlcPatient: z
    .string()
    .optional()
    .transform((t) => (t === "true" ? true : false)),

  "createdAt[from]": z.coerce.date().optional(),
  "createdAt[to]": z.coerce.date().optional(),
  "mlcDeclarationDate[from]": z.coerce.date().optional(),
  "mlcDeclarationDate[to]": z.coerce.date().optional(),
});

type PaginationValidatorType = z.infer<typeof paginationValidator>;

export { paginationValidator };
export type { PaginationValidatorType };
