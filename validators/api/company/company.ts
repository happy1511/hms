import { CompanyDetailsType } from "@/generated/prisma/enums";
import { z } from "zod";

const companyDetailsUpdateValidator = z.object({
  type: z.enum(CompanyDetailsType),
  name: z.string().trim().min(1, "Name is required"),
  address: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  letterheadHeightCm: z
    .number()
    .min(0, "Letterhead height cannot be negative")
    .max(30, "Letterhead height looks too large"),
});

type companyDetailsUpdateValidatorType = z.input<
  typeof companyDetailsUpdateValidator
>;

export { companyDetailsUpdateValidator };
export type { companyDetailsUpdateValidatorType };
