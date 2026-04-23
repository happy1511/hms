import { z } from "zod";

const importOptionalText = z.string().optional().default("");

const drugValidator = z.object({
  name: z.string().min(1, "Name is required"),
  manufacturer: z.string(),
  unit: z.string(),
  description: z.string().optional(),
});

const partialDrugValidator = drugValidator.partial().extend({
  drugId: z.coerce.number().min(1, "Supplier Id is required"),
});

const drugImportRowValidator = z.object({
  name: z.string().min(1, "name is required"),
  description: importOptionalText,
  manufacturer: z.string().min(1, "manufacturer is required"),
  unit: z.string().min(1, "unit is required"),
});

type drugValidatorType = z.input<typeof drugValidator>;
type partialDrugValidatorType = z.input<typeof partialDrugValidator>;
type DrugImportRow = z.infer<typeof drugImportRowValidator>;

export { drugValidator, partialDrugValidator, drugImportRowValidator };
export type { drugValidatorType, partialDrugValidatorType, DrugImportRow };
