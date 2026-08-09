import { RadiologySection, Status } from "@/generated/prisma/enums";
import z from "zod";

const radiologyTemplateValidator = z.object({
  name: z.string().min(1, "Name is required"),
  section: z.enum(RadiologySection),
  status: z.enum(Status).optional(),
  content: z.string().min(1, "Content is required"),
  radiologyTests: z.array(z.object({ id: z.coerce.number() })).optional(),
});

const radiologyTestValidator = z.object({
  name: z.string().min(1, "Name is required"),
  alias: z.string().min(1, "Alias is required"),
  section: z.enum(RadiologySection),
  status: z.enum(Status).optional(),
  billingSectionId: z.coerce.number().min(1, "Billing Section is required"),
  price: z.number().min(0, "Price must be a positive number"),
});

const radiologyTestImportRowValidator = z.object({
  name: z.string().min(1, "name is required"),
  alias: z.string().min(1, "alias is required"),
  section: z.enum(RadiologySection),
  status: z.enum(Status).optional().default(Status.active),
  price: z.coerce.number().min(0, "price must be a positive number"),
  billingSection: z.string().min(1, "billing section is required"),
});

const radiologyTemplateImportRowValidator = z.object({
  name: z.string().min(1, "name is required"),
  section: z.enum(RadiologySection),
  status: z.enum(Status).optional().default(Status.active),
  content: z.string().min(1, "content is required"),
  radiologyTests: z.string().optional().default(""),
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
type RadiologyTestImportRow = z.infer<typeof radiologyTestImportRowValidator>;
type RadiologyTemplateValidatorType = z.input<
  typeof radiologyTemplateValidator
>;
type RadiologyTemplateImportRow = z.infer<
  typeof radiologyTemplateImportRowValidator
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
  RadiologyTemplateImportRow,
  RadiologyTemplateValidatorType,
  RadiologyTestValidatorType,
  RadiologyTestImportRow,
  PartialRadiologyTestValidatorType,
  PartialRadiologyOrderValidatorType,
  RadiologyOrderValidatorType,
  RadiologyResultEntryValidatorType,
};
export {
  radiologyTemplateValidator,
  radiologyTemplateImportRowValidator,
  partialRadiologyTemplateValidator,
  partialRadiologyTestValidator,
  radiologyTestImportRowValidator,
  radiologyTestValidator,
  partialRadiologyTestOrder,
  radiologyTestOrder,
  radiologyResultsEntry,
};
