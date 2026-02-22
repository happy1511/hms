import {
  DiscountType,
  OpdArrival,
  PaymentCategory,
  PaymentMode,
} from "@/generated/prisma/enums";
import { z } from "zod";
import { patientValidator } from "../masters/patient";

// -------------------- Opd Bill --------------------

const billingItemValidator = z.object({
  index: z.coerce.number().optional(),
  billingSection: z.object({ id: z.coerce.number().min(1), name: z.string() }),
  service: z.object({
    id: z.coerce.number().min(1),
    name: z.string(),
    maxDiscount: z.number(),
  }),
  rate: z.coerce.number(),
  quantity: z.coerce.number(),
  discountType: z.enum(DiscountType).default(DiscountType.VALUE),
  discountValue: z.coerce.number().default(0),
  total: z.coerce.number(),
  createdAt: z.coerce.date(),
});

const transactionsValidator = z.object({
  index: z.coerce.number().optional(),
  amount: z.coerce.number(),
  mode: z.enum(PaymentMode).default(PaymentMode.CASH),
  remarks: z.string().max(500).nullable().optional(),
});

const opdBaseValidator = z.object({
  patientId: z.coerce.number().min(1, "Patient is required").optional(),
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

const opdInvoiceValidator = z
  .object({
    opdId: z.coerce.number(),
    rate: z.coerce.number(),
    discountType: z.enum(DiscountType).default(DiscountType.VALUE),
    discountValue: z.coerce.number().default(0),
    total: z.coerce.number().optional(),
    isFree: z.coerce.boolean().default(false),
    billingItem: z.array(
      z.object({
        id: z.coerce.number(),
        opdBillingItems: z.array(billingItemValidator),
      }),
    ),
    transactions: z.array(transactionsValidator),
  })
  .transform((data) => {
    const billingItem = data.billingItem.map((item) => {
      const opdBillingItems = item.opdBillingItems.map((t) => {
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

      return {
        ...item,
        opdBillingItems,
      };
    });

    const subTotal = billingItem.reduce(
      (sum, i) => sum + i.opdBillingItems.reduce((s, j) => s + j.total, 0),
      0,
    );

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
      item.opdBillingItems.forEach((t, rowIndex) => {
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
            path: [
              "billingItem",
              index,
              "opdBillingItems",
              rowIndex,
              "discountValue",
            ],
          });
        }
      });
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
          ? (gross * (item.service.maxDiscount ?? 0)) / 100
          : (item.service.maxDiscount ?? 0);

      if (discount > maxAllowed) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Discount cannot exceed max discount (${item.service.maxDiscount})`,
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

// -------------------- Opd File --------------------
const vitalsValidator = z.object({
  height: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  bpMm: z.coerce.number().optional(),
  bpHg: z.coerce.number().optional(),
  pulse: z.coerce.number().optional(),
  rbs: z.coerce.number().optional(),
  rr: z.coerce.number().optional(),
  spo2: z.coerce.number().optional(),
  temp: z.coerce.number().optional(),
  opdId: z.coerce.number(),
});

const consultationValidator = z.object({
  notes: z.string().optional().nullable(),
  generalExaminations: z.string().optional().nullable(),
  systemicExaminations: z.string().optional().nullable(),
  diagnosis: z.string().optional().nullable(),
  chronicIllness: z.string().optional().nullable(),
  advisedPathologyTests: z
    .array(z.object({ id: z.coerce.number() }))
    .optional()
    .nullable(),
  advisedRadiologyTests: z
    .array(z.object({ id: z.coerce.number() }))
    .optional()
    .nullable(),
});

const prescribedDrugValidator = z.object({
  index: z.coerce.number().optional().nullable(),
  name: z.string().min(1),
  days: z.coerce.number().min(1),
  frequency: z.coerce.number().min(1),
  remarks: z.string().optional().nullable(),
});

const prescriptionValidator = z.object({
  followUpAfterDays: z.coerce.number().optional().nullable(),
  followUpDate: z.coerce.date().optional().nullable(),
  followUpAdvice: z.string().optional().nullable(),
  otherAdvice: z.string().optional().nullable(),
  drugs: z.array(prescribedDrugValidator),
  opdId: z.coerce.number(),
});

const consultationFileValidator = consultationValidator.extend({
  prescription: prescriptionValidator,
  vitals: vitalsValidator,
  opdId: z.coerce.number(),
});

// -------------------- Opd Bill --------------------
type opdValidatorType = z.input<typeof opdValidator>;
type partialOpdValidatorType = z.input<typeof partialOpdValidator>;
type addOpdBillItemValidatorType = z.input<typeof addOpdBillItemValidator>;
type billingItemValidatorType = z.input<typeof billingItemValidator>;
type transactionValidatorType = z.input<typeof transactionsValidator>;
type addOpdTransactionValidatorType = z.input<
  typeof addOpdTransactionValidator
>;
type opdInvoiceValidatorType = z.input<typeof opdInvoiceValidator>;

// -------------------- Opd File --------------------
type vitalValidatorType = z.input<typeof vitalsValidator>;
type consultantFileType = z.input<typeof consultationFileValidator>;
type prescribedDrugType = z.input<typeof prescribedDrugValidator>;

export {
  opdValidator,
  billingItemValidator,
  transactionsValidator,
  partialOpdValidator,
  addOpdBillItemValidator,
  addOpdTransactionValidator,
  vitalsValidator,
  consultationFileValidator,
  prescribedDrugValidator,
  opdInvoiceValidator,
};
export type {
  opdValidatorType,
  billingItemValidatorType,
  transactionValidatorType,
  partialOpdValidatorType,
  addOpdBillItemValidatorType,
  addOpdTransactionValidatorType,
  vitalValidatorType,
  consultantFileType,
  prescribedDrugType,
  opdInvoiceValidatorType,
};
