import { z } from "zod";

const supplierValidator = z.object({
  name: z.string().min(1, "Name is required"),
  gstIn: z.coerce.number().optional(),
  email: z.string().optional(),
  phone: z.coerce.number().optional().default(0),
});

const partialSupplierValidator = supplierValidator.partial().extend({
  supplierId: z.coerce.number().min(1, "Supplier Id is required"),
});

type supplierValidatorType = z.input<typeof supplierValidator>;
type partialSupplierValidatorType = z.input<typeof partialSupplierValidator>;

export { supplierValidator, partialSupplierValidator };
export type { supplierValidatorType, partialSupplierValidatorType };
