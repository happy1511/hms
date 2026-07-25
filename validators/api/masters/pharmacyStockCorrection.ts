import z from "zod";

const today = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const stockCorrectionParamsValidator = z.object({
  inventoryItemId: z.coerce.number().int().min(1, "Inventory item is required"),
});

const stockCorrectionValidator = z.object({
  batchNo: z
    .string()
    .trim()
    .min(1, "Batch is required")
    .regex(/^[a-zA-Z0-9]+$/, "Batch must be alphanumeric"),
  expiryDate: z.coerce.date().refine((date) => date > today(), {
    message: "Expiry date must be in the future",
  }),
  mrp: z.coerce.number().min(0, "MRP cannot be negative"),
  quantityInStock: z.coerce
    .number()
    .int()
    .min(0, "Current stock cannot be negative"),
  sellingPrice: z.coerce.number().min(0, "Sale rate cannot be negative"),
  itemsPerPack: z.coerce
    .number()
    .int()
    .min(1, "Items per pack must be at least 1"),
});

type stockCorrectionValidatorType = z.input<typeof stockCorrectionValidator>;
type stockCorrectionParamsValidatorType = z.input<
  typeof stockCorrectionParamsValidator
>;

export { stockCorrectionValidator, stockCorrectionParamsValidator };
export type { stockCorrectionValidatorType, stockCorrectionParamsValidatorType };
