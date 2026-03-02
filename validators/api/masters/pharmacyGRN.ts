import z from "zod";

const grnItemValidator = z.object({
  id: z.coerce.number(),
  drug: z.object({
    id: z.coerce.number(),
    gstPercentage: z.coerce.number().default(0),
    cGstPercentage: z.coerce.number().default(0),
    sGstPercentage: z.coerce.number().default(0),
    iGstPercentage: z.coerce.number().default(0),
  }),
  batchNo: z.coerce.number().default(0),
  expiryDate: z.coerce.date(),
  manufacturingDate: z.coerce.date().default(new Date()),
  purchasePrice: z.coerce.number().default(0),
  mrp: z.coerce.number().default(0),
  sellingPrice: z.coerce.number().default(0),
  wholeSalePrice: z.coerce.number().default(0),
  quantityInStock: z.coerce.number().default(0),
});

const grnValidator = z.object({
  orderId: z.coerce.number(),
  grnItems: z.array(grnItemValidator),
});

type grnItemValidatorType = z.input<typeof grnItemValidator>;
type grnValidatorType = z.input<typeof grnValidator>;

export { grnItemValidator, grnValidator };
export type { grnItemValidatorType, grnValidatorType };
