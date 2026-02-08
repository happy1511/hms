import {
  AppointmentStatus,
  DoctorType,
  IdentityType,
  Status,
} from "@/generated/prisma/enums";
import { z } from "zod";

const paginationValidator = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(Status).optional(),
  appointmentStatus: z.enum(AppointmentStatus).optional(),
  doctorType: z.enum(DoctorType).optional(),
  uhid: z.string().optional(),
  contactNo: z.string().optional(),
  wardId: z.coerce.number().min(1).optional(),
  floorId: z.coerce.number().min(1).optional(),
  doctorId: z.coerce.number().min(1).optional(),
  documentType: z.enum(IdentityType).optional(),

  "createdAt[from]": z.coerce.date().optional(),
  "createdAt[to]": z.coerce.date().optional(),
});

type PaginationValidatorType = z.infer<typeof paginationValidator>;

export { paginationValidator };
export type { PaginationValidatorType };
