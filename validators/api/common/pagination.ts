import {
  AppointmentStatus,
  DoctorType,
  IdentityType,
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
  uhid: z.string().optional(),
  contactNo: z.string().optional(),
  roomId: z.coerce.number().min(1).optional(),
  departmentId: z.coerce.number().min(1).optional(),
  doctorId: z.coerce.number().min(1).optional(),
  billingSectionId: z.coerce.number().min(1).optional(),
  documentType: z.enum(IdentityType).optional(),
  pathologyTestType: z.enum(PathologyTestSection).optional(),
  radiologyTestType: z.enum(RadiologySection).optional(),
  pathologyTestId: z.coerce.number().optional(),
  defaultSelectedIds: z.array(z.coerce.number()).optional(),
  transactionType: z.enum(["opd", "ipd"]).optional(),
  opdId: z.coerce
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

  "createdAt[from]": z.coerce.date().optional(),
  "createdAt[to]": z.coerce.date().optional(),
});

type PaginationValidatorType = z.infer<typeof paginationValidator>;

export { paginationValidator };
export type { PaginationValidatorType };
