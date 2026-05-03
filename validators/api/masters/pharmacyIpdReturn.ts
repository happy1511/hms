import z from "zod";

const ipdReturnItemValidator = z.object({
  issueItemId: z.coerce.number().min(1),
  inventoryItemId: z.coerce.number().min(1),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  isLooseQuantity: z.coerce.boolean().default(false),
});

const ipdReturnValidator = z.object({
  ipdId: z.coerce.number().min(1, "IPD patient is required"),
  createdAt: z.coerce.date().default(new Date()),
  discountAmount: z.coerce.number().min(0).default(0),
  roundOffAmount: z.coerce.number().default(0),
  items: z.array(ipdReturnItemValidator).min(1, "Add at least one return item"),
});

type ipdReturnValidatorType = z.input<typeof ipdReturnValidator>;
type ipdReturnItemValidatorType = z.input<typeof ipdReturnItemValidator>;

export { ipdReturnValidator, ipdReturnItemValidator };
export type { ipdReturnValidatorType, ipdReturnItemValidatorType };
