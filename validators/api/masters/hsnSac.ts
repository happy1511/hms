import { z } from "zod";

const hsnSacImportRowValidator = z.object({
  code: z.coerce.number().min(1, "code is required"),
  cGstPercentage: z.coerce.number().min(0).default(0),
  sGstPercentage: z.coerce.number().min(0).default(0),
  iGstPercentage: z.coerce.number().min(0).default(0),
});

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
type HsnSacImportRow = z.infer<typeof hsnSacImportRowValidator>;
type partialHsnSacValidatorType = z.input<typeof partialHsnSacValidator>;

export { hsnSacValidator, partialHsnSacValidator, hsnSacImportRowValidator };
export type {
  HsnSacImportRow,
  hsnSacValidatorType,
  partialHsnSacValidatorType,
};
