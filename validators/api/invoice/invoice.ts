import {
  DiscountType,
  PaymentCategory,
  PaymentMode,
} from "@/generated/prisma/enums";
import z from "zod";

const billingItemValidator = z.object({
  index: z.coerce.string().optional(),
  itemId: z.coerce.number().optional(),
  billingSection: z.object({ id: z.coerce.number().min(1), name: z.string() }),
  service: z.object({
    id: z.coerce.number().min(1),
    name: z.string(),
    maxDiscount: z.coerce.number().nullable().optional().default(0),
  }),
  rate: z.coerce.number(),
  quantity: z.coerce.number(),
  discountType: z.enum(DiscountType).default(DiscountType.VALUE),
  discountValue: z.coerce.number().default(0),
  total: z.coerce.number(),
  updateReason: z.string().trim().max(1000).nullable().optional(),
  createdAt: z.coerce.date().default(new Date()),
});

const transactionsValidator = z.object({
  index: z.coerce.number().optional(),
  amount: z.coerce.number(),
  mode: z.enum(PaymentMode).default(PaymentMode.CASH),
  remarks: z.string().max(500).nullable().optional(),
});

const invoiceBaseValidator = z.object({
  rate: z.coerce.number(),
  discountType: z.enum(DiscountType).default(DiscountType.VALUE),
  discountValue: z.coerce.number().default(0),
  total: z.coerce.number().optional(),
  isFree: z.coerce.boolean().default(false),
  isPaid: z.coerce.boolean().default(false),
  createdAt: z.coerce.date().default(new Date()),
  billingType: z.enum(PaymentCategory),
  billingItems: z.array(billingItemValidator),
  transactions: z.array(transactionsValidator),
});

const updateInvoiceValidator = z.object({
  id: z.coerce.number(),
  rate: z.coerce.number(),
  discountType: z.enum(DiscountType).default(DiscountType.VALUE),
  discountValue: z.coerce.number().default(0),
  total: z.coerce.number().optional(),
  isFree: z.coerce.boolean().default(false),
  isPaid: z.coerce.boolean().default(false),
  createdAt: z.coerce.date().default(new Date()),
  billingType: z.enum(PaymentCategory),
  billingSections: z
    .array(
      z.object({
        id: z.coerce.number(),
        invoiceBillingSectionId: z.coerce.number().optional(),
        discountType: z.enum(DiscountType).default(DiscountType.VALUE),
        discountValue: z.coerce.number().default(0),
        billingItems: z.array(billingItemValidator),
      }),
    )
    .optional(),
  transactions: z.array(transactionsValidator).optional(),
});

const partialInvoiceValidator = invoiceBaseValidator.partial().extend({
  id: z.coerce.number(),
});

const addInvoiceBillItemValidator = billingItemValidator.extend({
  id: z.coerce.number(),
});

const addInvoiceTransactionValidator = transactionsValidator.extend({
  id: z.coerce.number(),
});

const invoiceValidator = invoiceBaseValidator
  .transform((data) => {
    const billingItems = data.billingItems.map((t) => {
      const gross = t.quantity * t.rate;

      const discount =
        t.discountType === DiscountType["PERCENTAGE"]
          ? (gross * t.discountValue) / 100
          : t.discountValue;

      return {
        ...t,
        total: gross - discount,
      };
    });

    const subTotal = billingItems.reduce((sum, i) => sum + i.total, 0);

    const discount =
      data.discountType === DiscountType["PERCENTAGE"]
        ? (subTotal * data.discountValue) / 100
        : data.discountValue;

    const total = subTotal - discount;

    return {
      ...data,
      billingItems,
      total,
    };
  })
  .superRefine((data, ctx) => {
    const total = data.total ?? 0;

    const transactionSum = data.transactions.reduce(
      (sum, t) => sum + t.amount,
      0,
    );

    data.billingItems.forEach((t, rowIndex) => {
      const gross = t.quantity * t.rate;

      const discount =
        t.discountType === DiscountType["PERCENTAGE"]
          ? (gross * t.discountValue) / 100
          : t.discountValue;

      const maxAllowed =
        t.discountType === DiscountType["PERCENTAGE"]
          ? (gross * (t.service.maxDiscount ?? 0)) / 100
          : (t.service.maxDiscount ?? 0);

      if (discount > maxAllowed) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Discount cannot exceed max discount (${t.service.maxDiscount})`,
          path: ["billingItems", rowIndex, "discountValue"],
        });
      }
    });
    if (data.isFree) {
      if (transactionSum > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Transactions should not exist for free OPD",
          path: ["transactions"],
        });
      }
      return;
    }

    if (transactionSum > total) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Transaction total (${transactionSum}) must equal bill total (${total})`,
        path: ["transactions"],
      });
    }
  });

type invoiceValidatorType = z.input<typeof invoiceValidator>;
type updateInvoiceValidatorType = z.input<typeof updateInvoiceValidator>;
type addInvoiceBillItemValidatorType = z.input<
  typeof addInvoiceBillItemValidator
>;
type addInvoiceTransactionValidatorType = z.input<
  typeof addInvoiceTransactionValidator
>;
type partialInvoiceValidatorType = z.input<typeof partialInvoiceValidator>;
type billingItemValidatorType = z.input<typeof billingItemValidator>;
type transactionValidatorType = z.input<typeof transactionsValidator>;

export type {
  invoiceValidatorType,
  billingItemValidatorType,
  transactionValidatorType,
  partialInvoiceValidatorType,
  addInvoiceBillItemValidatorType,
  addInvoiceTransactionValidatorType,
  updateInvoiceValidatorType,
};
export {
  invoiceValidator,
  billingItemValidator,
  partialInvoiceValidator,
  transactionsValidator,
  addInvoiceBillItemValidator,
  addInvoiceTransactionValidator,
  updateInvoiceValidator,
};
