import { z } from "zod";

const drugValidator = z.object({
  name: z.string().min(1, "Name is required"),
  hsnCode: z.number(),
  gstPercentage: z.number(),
  cGstPercentage: z.number(),
  sGstPercentage: z.number(),
  iGstPercentage: z.number(),
  manufacturer: z.string(),
  unit: z.string(),
  description: z.string().optional(),
});

const partialDrugValidator = drugValidator.partial().extend({
  drugId: z.coerce.number().min(1, "Supplier Id is required"),
});

type drugValidatorType = z.input<typeof drugValidator>;
type partialDrugValidatorType = z.input<typeof partialDrugValidator>;

export { drugValidator, partialDrugValidator };
export type { drugValidatorType, partialDrugValidatorType };
