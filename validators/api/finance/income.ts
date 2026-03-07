import { IncomeCategory, PaymentMode } from "@/generated/prisma/enums";
import { z } from "zod";

const incomeValidator = z.object({
  title: z.string().min(1, "Title is required"),
  mode: z.enum(PaymentMode),
  amount: z.coerce.number().positive("Amount should be greater than 0"),
  collectedOn: z.coerce.date(),
  collectedById: z.coerce.number().min(1, "Collected By is required"),
  description: z.string().optional().nullable(),
  category: z.enum(IncomeCategory, { message: "Category is required" }),
});

const partialIncomeValidator = incomeValidator.partial().extend({
  incomeId: z.coerce.number().min(1, "Income Id is required"),
});

type IncomeValidatorType = z.input<typeof incomeValidator>;
type PartialIncomeValidatorType = z.input<typeof partialIncomeValidator>;

export { incomeValidator, partialIncomeValidator };
export type { IncomeValidatorType, PartialIncomeValidatorType };
