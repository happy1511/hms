import {
  ServiceApplicableOn,
  ServiceType,
  Status,
} from "@/generated/prisma/enums";
import { paginationValidator } from "@/validators/api/common/pagination";
import { z } from "zod";

const importOptionalText = z.string().optional().default("");

const serviceValidator = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  isInvoiceOnly: z.coerce.boolean().default(false),
  isEditableRate: z.coerce.boolean().default(false),
  type: z.enum(ServiceType),
  status: z.enum(Status).optional(),
  price: z.number().min(0, "Price must be a positive number"),
  discountAvailable: z.boolean().optional(),
  maxDiscount: z
    .number()
    .min(0, "Max Discount must be a positive number")
    .optional(),
  applicableOn: z.enum(ServiceApplicableOn).optional(),
  connectedLabTests: z.array(z.object({ id: z.coerce.number() })).optional(),
  connectedRadiologyTests: z
    .array(z.object({ id: z.coerce.number() }))
    .optional(),
});

const partialServiceValidator = serviceValidator.partial().extend({
  serviceId: z.number().min(1, "Service Id is required"),
});

const serviceListValidator = paginationValidator.extend({
  isInvoiceOnly: z.coerce.boolean().optional(),
});

const serviceImportRowValidator = z.object({
  name: z.string().min(1, "name is required"),
  description: z.string().min(1, "description is required"),
  isInvoiceOnly: importOptionalText,
  isEditableRate: importOptionalText,
  type: z.enum(ServiceType),
  price: z.coerce.number().min(0, "price must be greater than or equal to 0"),
  discountAvailable: importOptionalText,
  maxDiscount: z.coerce.number().optional().default(0),
  applicableOn: z
    .enum(ServiceApplicableOn)
    .optional()
    .default(ServiceApplicableOn.BOTH),
  status: z.enum(Status).optional().default(Status.active),
  connectedLabTests: importOptionalText,
  connectedRadiologyTests: importOptionalText,
});

type ServiceValidatorType = z.input<typeof serviceValidator>;
type PartialServiceValidatorType = z.input<typeof partialServiceValidator>;
type ServiceImportRow = z.infer<typeof serviceImportRowValidator>;

export {
  serviceValidator,
  partialServiceValidator,
  serviceListValidator,
  serviceImportRowValidator,
};
export type {
  ServiceValidatorType,
  PartialServiceValidatorType,
  ServiceImportRow,
};
