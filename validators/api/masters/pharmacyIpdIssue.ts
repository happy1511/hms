import z from "zod";

const ipdIssueItemValidator = z.object({
  inventoryItem: z.object({ id: z.coerce.number().min(1) }),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  isLooseQuantity: z.coerce.boolean().default(false),
});

const ipdIssueValidator = z.object({
  ipdId: z.coerce.number().min(1, "IPD patient is required"),
  createdAt: z.coerce.date().default(new Date()),
  discountAmount: z.coerce.number().min(0).default(0),
  roundOffAmount: z.coerce.number().default(0),
  items: z.array(ipdIssueItemValidator).min(1, "Add at least one issue item"),
});

type ipdIssueValidatorType = z.input<typeof ipdIssueValidator>;
type ipdIssueItemValidatorType = z.input<typeof ipdIssueItemValidator>;

export { ipdIssueValidator, ipdIssueItemValidator };
export type { ipdIssueValidatorType, ipdIssueItemValidatorType };
