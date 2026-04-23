import z from "zod";

const challanItemValidator = z.object({
  id: z.coerce.number().optional(),
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
  category: z.object({ id: z.coerce.number().optional() }).optional(),
  hsnSacCode: z.coerce.number().optional(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  freeQuantity: z.coerce.number().default(0),
  packaging: z.string().optional(),
  qtyType: z.string().optional(),
  itemsPerPack: z.coerce.number().min(1).default(1),
  batchNo: z.coerce.number().default(0),
  expiryDate: z.coerce.date(),
  manufacturingDate: z.coerce.date().default(new Date()),
  purchasePrice: z.coerce.number().default(0),
  mrp: z.coerce.number().default(0),
  sellingPrice: z.coerce.number().default(0),
  wholeSalePrice: z.coerce.number().default(0),
});

const challanValidator = z.object({
  supplier: z.object({ id: z.coerce.number() }),
  challanNumber: z.string().trim().min(1, "Challan number is required"),
  invoiceNumber: z.string().trim().min(1, "Invoice number is required"),
  invoiceDate: z.coerce.date(),
  discountAmount: z.coerce.number().default(0),
  tcsAmount: z.coerce.number().default(0),
  packingForwarding: z.coerce.number().default(0),
  roundOffAmount: z.coerce.number().default(0),
  cnAmount: z.coerce.number().default(0),
  cnRef: z.string().optional(),
  challanItems: z.array(challanItemValidator).min(1, "At least one item is required"),
});

type challanItemValidatorType = z.input<typeof challanItemValidator>;
type challanValidatorType = z.input<typeof challanValidator>;

export { challanItemValidator, challanValidator };
export type { challanItemValidatorType, challanValidatorType };
