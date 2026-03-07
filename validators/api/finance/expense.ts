import { ExpenseCategory, PaymentMode } from "@/generated/prisma/enums";
import { z } from "zod";

const expenseValidator = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.enum(ExpenseCategory, { message: "Category is required" }),
  amount: z.coerce.number().positive("Amount should be greater than 0"),
  paymentMode: z.enum(PaymentMode),
  dateTime: z.coerce.date(),
  description: z.string().optional().nullable(),
});

const partialExpenseValidator = expenseValidator.partial().extend({
  expenseId: z.coerce.number().min(1, "Expense Id is required"),
});

type ExpenseValidatorType = z.input<typeof expenseValidator>;
type PartialExpenseValidatorType = z.input<typeof partialExpenseValidator>;

export { expenseValidator, partialExpenseValidator };
export type { ExpenseValidatorType, PartialExpenseValidatorType };
