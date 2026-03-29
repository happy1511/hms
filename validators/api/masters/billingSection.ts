import { Status } from "@/generated/prisma/enums";
import { z } from "zod";

const billingSectionValidator = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  isOtherCharges: z.coerce.boolean().default(false),
  status: z.enum(Status).optional(),
});

const partialBillingSectionValidator = billingSectionValidator
  .partial()
  .extend({
    sectionId: z.number().min(1, "Billing Section Id is required"),
  });

type BillingSectionValidatorType = z.input<typeof billingSectionValidator>;
type PartialBillingSectionValidatorType = z.input<
  typeof partialBillingSectionValidator
>;

export { billingSectionValidator, partialBillingSectionValidator };
export type { BillingSectionValidatorType, PartialBillingSectionValidatorType };
