import { FinanceCategoryType } from "@/generated/prisma/enums";
import { z } from "zod";

const financeCategoryValidator = z.object({
  name: z.string().trim().min(1, "Name is required"),
  type: z.enum(FinanceCategoryType, { message: "Type is required" }),
  description: z.string().optional().nullable(),
});

const partialFinanceCategoryValidator = financeCategoryValidator
  .partial()
  .extend({
    categoryId: z.coerce.number().min(1, "Category Id is required"),
  });

type FinanceCategoryValidatorType = z.input<typeof financeCategoryValidator>;
type PartialFinanceCategoryValidatorType = z.input<
  typeof partialFinanceCategoryValidator
>;

export { financeCategoryValidator, partialFinanceCategoryValidator };
export type {
  FinanceCategoryValidatorType,
  PartialFinanceCategoryValidatorType,
};
