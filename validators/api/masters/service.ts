import {
  ServiceApplicableOn,
  ServiceType,
  Status,
} from "@/generated/prisma/enums";
import { z } from "zod";

const serviceValidator = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(ServiceType),
  status: z.enum(Status).optional(),
  price: z.number().min(0, "Price must be a positive number"),
  discountAvailable: z.boolean().optional(),
  maxDiscount: z
    .number()
    .min(0, "Max Discount must be a positive number")
    .optional(),
  applicableOn: z.enum(ServiceApplicableOn).optional(),
  connectedLabTests: z.array(z.coerce.number()).optional(),
  connectedRadiologyTests: z.array(z.coerce.number()).optional(),
});

const partialServiceValidator = serviceValidator.partial().extend({
  serviceId: z.number().min(1, "Service Id is required"),
});

type ServiceValidatorType = z.input<typeof serviceValidator>;
type PartialServiceValidatorType = z.input<typeof partialServiceValidator>;

export { serviceValidator, partialServiceValidator };
export type { ServiceValidatorType, PartialServiceValidatorType };
