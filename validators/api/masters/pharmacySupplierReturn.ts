import z from "zod";

const supplierReturnItemValidator = z.object({
  inventoryItem: z.object({ id: z.coerce.number().min(1) }),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  isLooseQuantity: z.coerce.boolean().default(false),
});

const supplierReturnValidator = z.object({
  supplierId: z.coerce.number().min(1, "Supplier is required"),
  returnDate: z.coerce.date().default(new Date()),
  returnReason: z.string().trim().max(1000).nullable().optional(),
  items: z
    .array(supplierReturnItemValidator)
    .min(1, "At least one return item is required"),
});

type supplierReturnValidatorType = z.input<typeof supplierReturnValidator>;
type supplierReturnItemValidatorType = z.input<typeof supplierReturnItemValidator>;

export { supplierReturnValidator, supplierReturnItemValidator };
export type { supplierReturnValidatorType, supplierReturnItemValidatorType };
