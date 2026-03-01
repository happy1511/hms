import { z } from "zod";

const drugCategoryValidator = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

const partialDrugCategoryValidator = drugCategoryValidator.partial().extend({
  categoryId: z.coerce.number().min(1, "Category Id is required"),
});

type drugCategoryValidatorType = z.input<typeof drugCategoryValidator>;
type partialDrugCategoryValidatorType = z.input<
  typeof partialDrugCategoryValidator
>;

export { drugCategoryValidator, partialDrugCategoryValidator };
export type { drugCategoryValidatorType, partialDrugCategoryValidatorType };
