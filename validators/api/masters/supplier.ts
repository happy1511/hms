import { z } from "zod";

const importOptionalText = z.string().optional().default("");
const importOptionalNumberText = z.string().optional().default("");

const supplierValidator = z.object({
  name: z.string().min(1, "Name is required"),
  gstIn: z.string().optional(),
  email: z.string().optional(),
  phone: z.coerce.number().optional().default(0),
});

const partialSupplierValidator = supplierValidator.partial().extend({
  supplierId: z.coerce.number().min(1, "Supplier Id is required"),
});

const supplierImportRowValidator = z.object({
  name: z.string().min(1, "name is required"),
  gstIn: importOptionalNumberText,
  email: importOptionalText,
  phone: z.coerce.number().default(0),
});

type supplierValidatorType = z.input<typeof supplierValidator>;
type partialSupplierValidatorType = z.input<typeof partialSupplierValidator>;
type SupplierImportRow = z.infer<typeof supplierImportRowValidator>;

export { supplierValidator, partialSupplierValidator, supplierImportRowValidator };
export type {
  supplierValidatorType,
  partialSupplierValidatorType,
  SupplierImportRow,
};
