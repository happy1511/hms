import {
  DiscountType,
  OpdArrival,
  PaymentCategory,
  PaymentMode,
} from "@/generated/prisma/enums";
import { z } from "zod";
import { patientValidator } from "../masters/patient";

const billingItemValidator = z.object({
  index: z.coerce.number().optional(),
  billingSectionId: z.coerce.number().min(1),
  serviceId: z.coerce.number().min(1),
  serviceName: z.string().optional(),
  billingSectionName: z.string().optional(),
  quantity: z.coerce.number(),
  rate: z.coerce.number(),
  discountType: z.enum(DiscountType).default(DiscountType.VALUE),
  discountValue: z.coerce.number().default(0),
  total: z.coerce.number(),
  maxDiscount: z.coerce.number().optional().default(0),
  createdAt: z.coerce.date(),
});

const transactionsValidator = z.object({
  index: z.coerce.number().optional(),
  amount: z.coerce.number(),
  mode: z.enum(PaymentMode).default(PaymentMode.CASH),
  remarks: z.string().max(500).optional(),
});

const opdBaseValidator = z.object({
  patientId: z.coerce.number().min(1, "Patient is required"),
  patient: patientValidator,
  arrivalState: z.enum(OpdArrival),
  remarks: z.string().max(500).optional(),
  rate: z.coerce.number(),
  discountType: z.enum(DiscountType).default(DiscountType.VALUE),
  discountValue: z.coerce.number().default(0),
  total: z.coerce.number().optional(),
  isFree: z.coerce.boolean().default(false),
  isPaid: z.coerce.boolean().default(false),
  createdAt: z.coerce.date().default(new Date()),
  consultantDoctorId: z.coerce.number(),
  referredDoctorId: z.coerce.number().optional(),
  billingType: z.enum(PaymentCategory),
  billingItem: z.array(billingItemValidator),
  transactions: z.array(transactionsValidator),
});

const opdValidator = opdBaseValidator
  .transform((data) => {
    const billingItem = data.billingItem.map((item) => {
      const gross = item.quantity * item.rate;

      const discount =
        item.discountType === DiscountType["PERCENTAGE"]
          ? (gross * item.discountValue) / 100
          : item.discountValue;

      return {
        ...item,
        total: gross - discount,
      };
    });

    const subTotal = billingItem.reduce((sum, i) => sum + i.total, 0);

    const discount =
      data.discountType === DiscountType["PERCENTAGE"]
        ? (subTotal * data.discountValue) / 100
        : data.discountValue;

    const total = subTotal - discount;

    return {
      ...data,
      billingItem,
      total,
    };
  })
  .superRefine((data, ctx) => {
    const total = data.total ?? 0;

    const transactionSum = data.transactions.reduce(
      (sum, t) => sum + t.amount,
      0,
    );

    data.billingItem.forEach((item, index) => {
      const gross = item.quantity * item.rate;

      const discount =
        item.discountType === DiscountType["PERCENTAGE"]
          ? (gross * item.discountValue) / 100
          : item.discountValue;

      const maxAllowed =
        item.discountType === DiscountType["PERCENTAGE"]
          ? (gross * (item.maxDiscount ?? 0)) / 100
          : (item.maxDiscount ?? 0);

      if (discount > maxAllowed) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Discount cannot exceed max discount (${item.maxDiscount})`,
          path: ["billingItem", index, "discountValue"],
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

    if (transactionSum !== total) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Transaction total (${transactionSum}) must equal bill total (${total})`,
        path: ["transactions"],
      });
    }
  });

const partialOpdValidator = opdBaseValidator.partial().extend({
  opdId: z.coerce.number(),
});

const addOpdBillItemValidator = billingItemValidator.extend({
  billId: z.coerce.number(),
});

const addOpdTransactionValidator = transactionsValidator.extend({
  billId: z.coerce.number(),
});

type opdValidatorType = z.input<typeof opdValidator>;
type partialOpdValidatorType = z.input<typeof partialOpdValidator>;
type addOpdBillItemValidatorType = z.input<typeof addOpdBillItemValidator>;
type billingItemValidatorType = z.input<typeof billingItemValidator>;
type transactionValidatorType = z.input<typeof transactionsValidator>;
type addOpdTransactionValidatorType = z.input<
  typeof addOpdTransactionValidator
>;

export {
  opdValidator,
  billingItemValidator,
  transactionsValidator,
  partialOpdValidator,
  addOpdBillItemValidator,
  addOpdTransactionValidator,
};
export type {
  opdValidatorType,
  billingItemValidatorType,
  transactionValidatorType,
  partialOpdValidatorType,
  addOpdBillItemValidatorType,
  addOpdTransactionValidatorType,
};
