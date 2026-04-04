import z from "zod";

const pharmacyCustomerBaseValidator = z.object({
  name: z.string().trim().min(1, "Customer name is required"),
  address: z.string().trim().optional().nullable(),
  contact: z.string().trim().optional().nullable(),
  isBusinessCustomer: z.coerce.boolean().default(false),
  dlNumber: z.string().trim().optional().nullable(),
  gstNumber: z.string().trim().optional().nullable(),
  patientId: z.coerce.number().min(1).optional(),
});

const pharmacyCustomerValidator = pharmacyCustomerBaseValidator.superRefine(
  (data, ctx) => {
    if (data.isBusinessCustomer && !data.dlNumber && !data.gstNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "DL number or GST number is required for business customer",
        path: ["dlNumber"],
      });
    }
  },
);

const partialPharmacyCustomerValidator = pharmacyCustomerBaseValidator
  .partial()
  .extend({
    customerId: z.coerce.number().min(1),
  });

type pharmacyCustomerValidatorType = z.input<typeof pharmacyCustomerValidator>;
type partialPharmacyCustomerValidatorType = z.input<
  typeof partialPharmacyCustomerValidator
>;

export { pharmacyCustomerValidator, partialPharmacyCustomerValidator };
export type {
  pharmacyCustomerValidatorType,
  partialPharmacyCustomerValidatorType,
};
