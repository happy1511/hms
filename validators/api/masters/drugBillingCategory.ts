import { z } from "zod";

const drugBillingCategoryValidator = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

const partialDrugBillingCategoryValidator = drugBillingCategoryValidator
  .partial()
  .extend({
    categoryId: z.coerce.number().min(1, "Category Id is required"),
  });

type drugBillingCategoryValidatorType = z.input<
  typeof drugBillingCategoryValidator
>;
type partialDrugBillingCategoryValidatorType = z.input<
  typeof partialDrugBillingCategoryValidator
>;

export { drugBillingCategoryValidator, partialDrugBillingCategoryValidator };
export type {
  drugBillingCategoryValidatorType,
  partialDrugBillingCategoryValidatorType,
};
