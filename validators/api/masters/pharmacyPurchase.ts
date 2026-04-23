import { z } from "zod";

const purchaseItems = z.object({
  drug: z.object({
    id: z.coerce.number(),
    name: z.string().optional(),
  }),
  hsnSac: z
    .object({
      id: z.coerce.number(),
      code: z.coerce.number(),
      cGstPercentage: z.coerce.number().default(0),
      sGstPercentage: z.coerce.number().default(0),
      iGstPercentage: z.coerce.number().default(0),
    })
    .nullable()
    .optional(),
  quantity: z.coerce.number().min(1, "Invalid Quantity"),
  hsnSacCode: z.coerce.number().optional(),
  category: z.object({ id: z.coerce.number() }).optional(),
  discountPercentage: z.coerce.number(),
  rate: z.coerce.number(),
  total: z.coerce.number(),
});

const purchaseOrderValidator = z.object({
  supplier: z.object({ id: z.coerce.number() }),
  remarks: z.string().optional(),
  termsAndConditions: z.string().optional(),
  orderDate: z.coerce.date().default(new Date()),
  packingForwarding: z.coerce.number().default(0),
  tcsAmount: z.coerce.number().default(0),
  roundOffAmount: z.coerce.number().default(0),
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
