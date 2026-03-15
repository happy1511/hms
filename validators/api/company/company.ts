import { z } from "zod";

const companyDetailsUpdateValidator = z.object({
  name: z.string().trim().min(1, "Name is required"),
  address: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
});

type companyDetailsUpdateValidatorType = z.input<
  typeof companyDetailsUpdateValidator
>;

export { companyDetailsUpdateValidator };
export type { companyDetailsUpdateValidatorType };

