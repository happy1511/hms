import { DiscountType, PaymentCategory, PaymentMode } from "@/generated/prisma/enums";
import z from "zod";

const saleBillItemValidator = z.object({
  inventoryItem: z.object({ id: z.coerce.number().min(1) }),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  rate: z.coerce.number().min(0).optional(),
  discountType: z.enum(DiscountType).default(DiscountType.VALUE),
  discountValue: z.coerce.number().default(0),
  total: z.coerce.number().optional(),
});

const saleBillTransactionValidator = z.object({
  amount: z.coerce.number().min(0),
  mode: z.enum(PaymentMode).default(PaymentMode.CASH),
  remarks: z.string().max(500).nullable().optional(),
});

const saleBillBaseValidator = z.object({
    name: z.string().min(1, "Bill name is required"),
    patientId: z.coerce.number().min(1).optional(),
    doctorId: z.coerce.number().min(1).optional(),
    billingType: z.enum(PaymentCategory).default(PaymentCategory.SELF_PAY),
    discountType: z.enum(DiscountType).default(DiscountType.VALUE),
    discountValue: z.coerce.number().default(0),
    isFree: z.coerce.boolean().default(false),
    items: z.array(saleBillItemValidator).min(1, "At least one sale item is required"),
    transactions: z.array(saleBillTransactionValidator).default([]),
    createdAt: z.coerce.date().default(new Date()),
  });

const saleBillValidator = saleBillBaseValidator
  .transform((data) => {
    const items = data.items.map((item) => {
      const rate = Number(item.rate ?? 0);
      const gross = item.quantity * rate;
      const discount =
        item.discountType === DiscountType.PERCENTAGE
          ? (gross * item.discountValue) / 100
          : item.discountValue;

      return {
        ...item,
        rate,
        total: Math.max(gross - discount, 0),
      };
    });

    const rate = items.reduce((sum, item) => sum + item.total, 0);
    const invoiceDiscount =
      data.discountType === DiscountType.PERCENTAGE
        ? (rate * data.discountValue) / 100
        : data.discountValue;

    const total = data.isFree ? 0 : Math.max(rate - invoiceDiscount, 0);

    return {
      ...data,
      items,
      rate,
      total,
      isPaid: !data.isFree && data.transactions.length > 0,
    };
  })
  .superRefine((data, ctx) => {
    const transactionSum = data.transactions.reduce((sum, t) => sum + t.amount, 0);

    if (data.isFree && transactionSum > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Transactions should not exist for free bill",
        path: ["transactions"],
      });
    }

    // Final bill total is computed using inventory-drug GST slabs in controller.
    // Keep non-free transaction validation at controller level where tax is available.
  });

const partialSaleBillValidator = saleBillBaseValidator.partial().extend({
  billId: z.coerce.number().min(1),
});

type saleBillValidatorType = z.input<typeof saleBillValidator>;
type partialSaleBillValidatorType = z.input<typeof partialSaleBillValidator>;
type saleBillItemValidatorType = z.input<typeof saleBillItemValidator>;
type saleBillTransactionValidatorType = z.input<typeof saleBillTransactionValidator>;

export { saleBillValidator, partialSaleBillValidator, saleBillItemValidator };
export type {
  saleBillValidatorType,
  partialSaleBillValidatorType,
  saleBillItemValidatorType,
  saleBillTransactionValidatorType,
};
