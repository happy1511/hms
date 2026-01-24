import { DoctorType, Status } from "@/generated/prisma/enums";
import { z } from "zod";

const paginationValidator = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(Status).optional(),
  doctorType: z.enum(DoctorType).optional(),
});

type PaginationValidatorType = z.infer<typeof paginationValidator>;

export { paginationValidator };
export type { PaginationValidatorType };
