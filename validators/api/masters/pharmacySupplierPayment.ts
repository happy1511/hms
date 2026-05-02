import { SupplierPaymentType } from "@/generated/prisma/enums";
import z from "zod";

const supplierPaymentAllocationValidator = z.object({
  grnId: z.coerce.number().int().min(1, "GRN is required"),
  amount: z.coerce.number().positive("Adjust amount must be greater than 0"),
});

const supplierPaymentValidator = z
  .object({
    supplierId: z.coerce.number().int().min(1, "Supplier is required"),
    paymentDate: z.coerce.date().default(new Date()),
    amount: z.coerce.number().positive("Amount must be greater than 0"),
    reference: z.string().trim().max(1000).nullable().optional(),
    type: z.enum(SupplierPaymentType),
    allocations: z.array(supplierPaymentAllocationValidator).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.type === SupplierPaymentType.DEBIT) {
      if (data.allocations.length) {
        const allocationTotal = Number(
          data.allocations.reduce((sum, item) => sum + Number(item.amount || 0), 0),
        );

        if (Number(data.amount || 0) !== allocationTotal) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["amount"],
            message: "Amount must match the total adjusted amount",
          });
        }
      }
    }

    if (data.type === SupplierPaymentType.CREDIT && data.allocations.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["allocations"],
        message: "Credit notes cannot contain GRN adjustments",
      });
    }
  });

type supplierPaymentValidatorType = z.input<typeof supplierPaymentValidator>;
type supplierPaymentAllocationValidatorType = z.input<
  typeof supplierPaymentAllocationValidator
>;

export { supplierPaymentValidator, supplierPaymentAllocationValidator };
export type {
  supplierPaymentValidatorType,
  supplierPaymentAllocationValidatorType,
};
