import { RadiologySection, Status } from "@/generated/prisma/enums";
import z from "zod";

const radiologyTemplateValidator = z.object({
  name: z.string().min(1, "Name is required"),
  section: z.enum(RadiologySection),
  status: z.enum(Status).optional(),
  content: z.string().min(1, "Content is required"),
  radiologyTests: z.array(z.coerce.number()).optional(),
});

const radiologyTestValidator = z.object({
  name: z.string().min(1, "Name is required"),
  alias: z.string().min(1, "Alias is required"),
  section: z.enum(RadiologySection),
  status: z.enum(Status).optional(),
  price: z.number().min(0, "Price must be a positive number"),
});

const partialRadiologyTestValidator = radiologyTestValidator.partial().extend({
  testId: z.coerce.number().min(1, "Service Id is required"),
});

const partialRadiologyTemplateValidator = radiologyTemplateValidator
  .partial()
  .extend({
    templateId: z.coerce.number().min(1, "Template Id is required"),
  });

// ----------- Radiology Test Order ------------
const radiologyTestResults = z.object({
  templateId: z.coerce.number(),
  value: z.string().min(1),
});

const radiologyTestOrder = z.object({
  isCancelled: z.boolean().optional().default(false),
  isOutSourced: z.boolean().optional().default(false),
  results: radiologyTestResults.optional(),
  orderId: z.coerce.number().min(1),
});

const partialRadiologyTestOrder = radiologyTestOrder.partial().extend({
  orderId: z.coerce.number().min(1),
});

const radiologyResultsEntry = z.object({
  results: radiologyTestResults.optional(),
  orderId: z.coerce.number().min(1),
});

type RadiologyTestValidatorType = z.input<typeof radiologyTestValidator>;
type PartialRadiologyTestValidatorType = z.input<
  typeof partialRadiologyTestValidator
>;
type RadiologyTemplateValidatorType = z.input<
  typeof radiologyTemplateValidator
>;
type PartialRadiologyTemplateValidatorType = z.input<
  typeof partialRadiologyTemplateValidator
>;

// ----------- Radiology Test Order ------------
type PartialRadiologyOrderValidatorType = z.input<
  typeof partialRadiologyTestOrder
>;
type RadiologyOrderValidatorType = z.input<typeof radiologyTestOrder>;
type RadiologyResultEntryValidatorType = z.input<typeof radiologyResultsEntry>;

export type {
  PartialRadiologyTemplateValidatorType,
  RadiologyTemplateValidatorType,
  RadiologyTestValidatorType,
  PartialRadiologyTestValidatorType,
  PartialRadiologyOrderValidatorType,
  RadiologyOrderValidatorType,
  RadiologyResultEntryValidatorType,
};
export {
  radiologyTemplateValidator,
  partialRadiologyTemplateValidator,
  partialRadiologyTestValidator,
  radiologyTestValidator,
  partialRadiologyTestOrder,
  radiologyTestOrder,
  radiologyResultsEntry,
};
