import { Status } from "@/generated/prisma/enums";
import { z } from "zod";

const importOptionalText = z.string().optional().default("");

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

const billingSectionImportRowValidator = z.object({
  name: z.string().min(1, "name is required"),
  systemKey: importOptionalText,
  isOtherCharges: importOptionalText,
  isDoctorConsultationCharges: importOptionalText,
  description: importOptionalText,
  status: z.enum(Status).optional().default(Status.active),
});

type BillingSectionValidatorType = z.input<typeof billingSectionValidator>;
type PartialBillingSectionValidatorType = z.input<
  typeof partialBillingSectionValidator
>;
type BillingSectionImportRow = z.infer<typeof billingSectionImportRowValidator>;

export {
  billingSectionValidator,
  partialBillingSectionValidator,
  billingSectionImportRowValidator,
};
export type {
  BillingSectionValidatorType,
  PartialBillingSectionValidatorType,
  BillingSectionImportRow,
};
