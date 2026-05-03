import { z } from "zod";

const drugBillingCategoryImportRowValidator = z.object({
  name: z.string().min(1, "name is required"),
  description: z.string().optional().default(""),
});

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
type DrugBillingCategoryImportRow = z.infer<
  typeof drugBillingCategoryImportRowValidator
>;
type partialDrugBillingCategoryValidatorType = z.input<
  typeof partialDrugBillingCategoryValidator
>;

export {
  drugBillingCategoryValidator,
  partialDrugBillingCategoryValidator,
  drugBillingCategoryImportRowValidator,
};
export type {
  DrugBillingCategoryImportRow,
  drugBillingCategoryValidatorType,
  partialDrugBillingCategoryValidatorType,
};
