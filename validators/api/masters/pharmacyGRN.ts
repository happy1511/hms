import z from "zod";

const grnItemValidator = z.object({
  id: z.coerce.number().optional(),
  drug: z.object({
    id: z.coerce.number(),
    gstPercentage: z.coerce.number().default(0),
    cGstPercentage: z.coerce.number().default(0),
    sGstPercentage: z.coerce.number().default(0),
    iGstPercentage: z.coerce.number().default(0),
  }),
  category: z.object({ id: z.coerce.number() }),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  batchNo: z.coerce.number().default(0),
  expiryDate: z.coerce.date(),
  manufacturingDate: z.coerce.date().default(new Date()),
  purchasePrice: z.coerce.number().default(0),
  mrp: z.coerce.number().default(0),
  sellingPrice: z.coerce.number().default(0),
  wholeSalePrice: z.coerce.number().default(0),
});

const grnValidator = z.object({
  orderId: z.coerce.number().optional(),
  supplier: z.object({ id: z.coerce.number() }).optional(),
  grnItems: z.array(grnItemValidator),
}).superRefine((data, ctx) => {
  if (!data.orderId && !data.supplier?.id) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Supplier is required when creating GRN without PO",
      path: ["supplier"],
    });
  }
});

type grnItemValidatorType = z.input<typeof grnItemValidator>;
type grnValidatorType = z.input<typeof grnValidator>;

export { grnItemValidator, grnValidator };
export type { grnItemValidatorType, grnValidatorType };
