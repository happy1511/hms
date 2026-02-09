import {
  ContainerType,
  PathologyTestSection,
  ReferenceRangeSex,
  SampleType,
  Status,
} from "@/generated/prisma/enums";
import { z } from "zod";

const parameterOptionValidator = z.object({
  value: z.string().min(1, "Option value is required"),
});

const referenceRangeValidator = z.object({
  applicableGender: z.enum(ReferenceRangeSex),

  lowerDay: z.string().optional(),
  upperDay: z.string().optional(),
  lowerMonth: z.string().optional(),
  upperMonth: z.string().optional(),
  lowerYear: z.string().optional(),
  upperYear: z.string().optional(),

  lowerRange: z.string().optional(),
  upperRange: z.string().optional(),
  unit: z.string().optional(),
});

const pathologyTestParameterValidator = z.object({
  name: z.string().min(1, "Parameter name is required"),
  displayOrder: z.number().min(0),
  isDescriptiveOnly: z.boolean().default(false),

  referenceRanges: z.array(referenceRangeValidator).optional(),
  parameterOptions: z.array(parameterOptionValidator).optional(),
});

const pathologyTestHeaderValidator = z.object({
  name: z.string().min(1, "Header name is required"),
  note: z.string().optional(),
  displayOrder: z.number().min(0),

  parameters: z.array(pathologyTestParameterValidator).optional(),
});

const pathologyTestValidator = z.object({
  name: z.string().min(1, "Name is required"),
  alias: z.string().min(1, "Alias is required"),
  section: z.enum(PathologyTestSection),
  container: z.enum(ContainerType),
  sampleType: z.enum(SampleType),
  footerNotes: z.string().optional(),

  status: z.enum(Status).optional(),
  price: z.number().min(0, "Price must be a positive number"),
  headers: z.array(pathologyTestHeaderValidator).optional(),

  parameters: z.array(pathologyTestParameterValidator).optional(),
});

const partialPathologyTestValidator = pathologyTestValidator.partial().extend({
  testId: z.number().min(1, "Service Id is required"),
});

const addParameterToTestValidator = pathologyTestParameterValidator.extend({
  testId: z.number().min(1, "Service Id is required"),
  headerId: z.number().min(1, "Header Id is required").optional(),
});

const updateParameterToTestValidator = pathologyTestParameterValidator.extend({
  testId: z.number().min(1, "Service Id is required"),
  headerId: z.number().min(1, "Header Id is required").optional(),
  parameterId: z.number().min(1, "Parameter Id is required"),
});

const partialParameterTestValidator = pathologyTestParameterValidator
  .partial()
  .extend({
    parameterId: z.number().min(1, "Parameter Id is required"),
  });

type PathologyTestValidatorType = z.input<typeof pathologyTestValidator>;
type PartialPathologyTestValidatorType = z.input<
  typeof partialPathologyTestValidator
>;
type AddParameterToTestValidatorType = z.input<
  typeof addParameterToTestValidator
>;
type UpdateParameterToTestValidatorType = z.input<
  typeof updateParameterToTestValidator
>;
type PartialParameterToTestValidatorType = z.input<
  typeof partialParameterTestValidator
>;

export {
  pathologyTestValidator,
  partialPathologyTestValidator,
  addParameterToTestValidator,
  updateParameterToTestValidator,
  partialParameterTestValidator,
};
export type {
  PathologyTestValidatorType,
  PartialPathologyTestValidatorType,
  AddParameterToTestValidatorType,
  UpdateParameterToTestValidatorType,
  PartialParameterToTestValidatorType,
};
