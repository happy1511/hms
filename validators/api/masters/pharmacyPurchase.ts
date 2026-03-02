import { z } from "zod";

const purchaseItems = z.object({
  drug: z.object({
    id: z.coerce.number(),
    gstPercentage: z.coerce.number().default(0),
    cGstPercentage: z.coerce.number().default(0),
    sGstPercentage: z.coerce.number().default(0),
    iGstPercentage: z.coerce.number().default(0),
  }),
  quantity: z.coerce.number().min(1, "Invalid Quantity"),
  category: z.object({ id: z.coerce.number() }),
  discountPercentage: z.coerce.number(),
  rate: z.coerce.number(),
  total: z.coerce.number(),
});

const purchaseOrderValidator = z.object({
  supplier: z.object({ id: z.coerce.number() }),
  remarks: z.string().optional(),
  orderDate: z.coerce.date().default(new Date()),
  items: z.array(purchaseItems),
});

const partialPurchaseOrderValidator = purchaseOrderValidator.partial().extend({
  orderId: z.coerce.number().min(1, "Order Id is required"),
});

type purchaseOrderValidatorType = z.input<typeof purchaseOrderValidator>;
type partialPurchaseOrderValidatorType = z.input<
  typeof partialPurchaseOrderValidator
>;

export { purchaseOrderValidator, partialPurchaseOrderValidator };
export type { purchaseOrderValidatorType, partialPurchaseOrderValidatorType };
