import { z } from "zod";

const hsnSacValidator = z.object({
  code: z.coerce.number().min(1, "Code is required"),
  cGstPercentage: z.coerce.number().min(0).default(0),
  sGstPercentage: z.coerce.number().min(0).default(0),
  iGstPercentage: z.coerce.number().min(0).default(0),
});

const partialHsnSacValidator = hsnSacValidator.partial().extend({
  hsnSacId: z.coerce.number().min(1, "HSN/SAC Id is required"),
});

type hsnSacValidatorType = z.input<typeof hsnSacValidator>;
type partialHsnSacValidatorType = z.input<typeof partialHsnSacValidator>;

export { hsnSacValidator, partialHsnSacValidator };
export type { hsnSacValidatorType, partialHsnSacValidatorType };
