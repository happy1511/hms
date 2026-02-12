import { RadiologySection, Status } from "@/generated/prisma/enums";
import z from "zod";

const radiologyTemplateValidator = z.object({
  name: z.string().min(1, "Name is required"),
  section: z.enum(RadiologySection),
  status: z.enum(Status).optional(),
  content: z.string().min(1, "Content is required"),
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

export type {
  PartialRadiologyTemplateValidatorType,
  RadiologyTemplateValidatorType,
  RadiologyTestValidatorType,
  PartialRadiologyTestValidatorType,
};
export {
  radiologyTemplateValidator,
  partialRadiologyTemplateValidator,
  partialRadiologyTestValidator,
  radiologyTestValidator,
};
