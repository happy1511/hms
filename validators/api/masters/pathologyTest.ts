import {
  ContainerType,
  PathologyTestSection,
  ReferenceRangeSex,
  SampleType,
  Status,
} from "@/generated/prisma/enums";
import { z } from "zod";

// ----------- Pathology Test ------------
const parameterOptionValidator = z.object({
  value: z.string().min(1, "Option value is required"),
});

const referenceRangeValidator = z.object({
  applicableGender: z.enum(ReferenceRangeSex),

  lowerAgeDay: z.coerce.number().optional().nullable(),
  upperAgeDay: z.coerce.number().optional().nullable(),
  lowerAgeMonth: z.coerce.number().optional().nullable(),
  upperAgeMonth: z.coerce.number().optional().nullable(),
  lowerAgeYear: z.coerce.number().optional().nullable(),
  upperAgeYear: z.coerce.number().optional().nullable(),

  lowerRange: z.coerce.number().optional().nullable(),
  upperRange: z.coerce.number().optional().nullable(),
  unit: z.string().optional().nullable(),
});

const pathologyTestParameterValidator = z.object({
  name: z.string().min(1, "Parameter name is required"),
  displayOrder: z.coerce.number().min(0),
  isDescriptiveOnly: z.boolean().default(false),

  referenceRanges: z.array(referenceRangeValidator).optional(),
  parameterOptions: z.array(parameterOptionValidator).optional(),
});

const pathologyTestHeaderValidator = z.object({
  name: z.string().min(1, "Header name is required"),
  note: z.string().optional(),
  displayOrder: z.coerce.number().min(0),

  parameters: z.array(pathologyTestParameterValidator).optional(),
});

const pathologyTestValidator = z.object({
  name: z.string().min(1, "Name is required"),
  alias: z.string().min(1, "Alias is required"),
  section: z.enum(PathologyTestSection),
  container: z.enum(ContainerType),
  sampleType: z.enum(SampleType),
  footerNotes: z.string().optional().nullable(),

  status: z.enum(Status).optional(),
  price: z.number().min(0, "Price must be a positive number"),
  headers: z.array(pathologyTestHeaderValidator).optional(),

  parameters: z.array(pathologyTestParameterValidator).optional(),
});

const partialPathologyTestValidator = pathologyTestValidator.partial().extend({
  testId: z.coerce.number().min(1, "Service Id is required"),
});

const addParameterToTestValidator = pathologyTestParameterValidator.extend({
  testId: z.coerce.number().min(1, "Service Id is required"),
  headerId: z.coerce.number().min(1, "Header Id is required").optional(),
});

const updateParameterToTestValidator = pathologyTestParameterValidator.extend({
  testId: z.coerce.number().min(1, "Service Id is required"),
  headerId: z.coerce.number().min(1, "Header Id is required").optional(),
  parameterId: z.coerce.number().min(1, "Parameter Id is required"),
});

const partialParameterTestValidator = pathologyTestParameterValidator
  .partial()
  .extend({
    parameterId: z.coerce.number().min(1, "Parameter Id is required"),
  });

const addParameterHeaderToTestValidator = pathologyTestHeaderValidator.extend({
  testId: z.coerce.number().min(1, "Test Id is required"),
});

const updateParameterHeaderToTestValidator =
  pathologyTestHeaderValidator.extend({
    testId: z.coerce.number().min(1, "Test Id is required"),
    headerId: z.coerce.number().min(1, "Header Id is required"),
  });

const partialParameterHeaderValidator = pathologyTestHeaderValidator
  .partial()
  .extend({
    headerId: z.coerce.number().min(1, "Parameter Id is required"),
  });

const addOptionToParameterValidator = parameterOptionValidator.extend({
  parameterId: z.coerce.number().min(1, "Parameter Id is required"),
});

const partialOptionValidator = parameterOptionValidator.partial().extend({
  optionId: z.coerce.number().min(1, "Option Id is required"),
});

const addReferenceRangeToParameterValidator = referenceRangeValidator.extend({
  parameterId: z.coerce.number().min(1, "Parameter Id is required"),
});

const updateReferenceRangeToParameterValidator = referenceRangeValidator.extend(
  {
    parameterId: z.coerce.number().min(1, "Parameter Id is required"),
    referenceRangeId: z.coerce.number().min(1, "Range Id is required"),
  },
);

const partialReferenceRangeValidator = referenceRangeValidator
  .partial()
  .extend({
    referenceRangeId: z.coerce.number().min(1, "Parameter Id is required"),
  });

// ----------- Pathology Test Order ------------
const pathologyTestResults = z.object({
  parameterId: z.coerce.number(),
  numericValue: z.coerce.number().optional(),
  textValue: z.string().optional(),
  optionId: z.coerce.number().optional(),
});

const pathologyTestOrder = z.object({
  isCancelled: z.boolean().optional().default(false),
  isOutSourced: z.boolean().optional().default(false),
  results: z.array(pathologyTestResults).optional(),
  orderId: z.coerce.number().min(1),
});

const partialPathologyTestOrder = pathologyTestOrder.partial().extend({
  orderId: z.coerce.number().min(1),
});

const pathologyResultsEntry = z.object({
  parameters: z.array(pathologyTestResults).optional(),
  orderId: z.coerce.number().min(1),
});

// ----------- Pathology Test ------------
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
type AddParameterHeaderToTestValidatorType = z.input<
  typeof addParameterHeaderToTestValidator
>;
type UpdateParameterHeaderToTestValidatorType = z.input<
  typeof updateParameterHeaderToTestValidator
>;
type PartialParameterHeaderToTestValidatorType = z.input<
  typeof partialParameterHeaderValidator
>;
type AddReferenceRangeToParameterValidatorType = z.input<
  typeof addReferenceRangeToParameterValidator
>;
type UpdateReferenceRangeToParameterValidatorType = z.input<
  typeof updateReferenceRangeToParameterValidator
>;
type PartialReferenceRangeToParameterValidatorType = z.input<
  typeof partialReferenceRangeValidator
>;
type AddOptionToParameterValidatorType = z.input<
  typeof addOptionToParameterValidator
>;
type PartialOptionToParameterValidatorType = z.input<
  typeof partialOptionValidator
>;

// ----------- Pathology Test Order ------------
type PartialPathologyOrderValidatorType = z.input<
  typeof partialPathologyTestOrder
>;
type PathologyOrderValidatorType = z.input<typeof pathologyTestOrder>;
type PathologyResultEntryValidatorType = z.input<typeof pathologyResultsEntry>;

export {
  pathologyTestValidator,
  partialPathologyTestValidator,
  addParameterToTestValidator,
  updateParameterToTestValidator,
  partialParameterTestValidator,
  addParameterHeaderToTestValidator,
  updateParameterHeaderToTestValidator,
  partialParameterHeaderValidator,
  addReferenceRangeToParameterValidator,
  updateReferenceRangeToParameterValidator,
  partialReferenceRangeValidator,
  addOptionToParameterValidator,
  partialOptionValidator,
  partialPathologyTestOrder,
  pathologyTestOrder,
  pathologyTestResults,
  pathologyResultsEntry,
};
export type {
  PathologyTestValidatorType,
  PartialPathologyTestValidatorType,
  AddParameterToTestValidatorType,
  UpdateParameterToTestValidatorType,
  PartialParameterToTestValidatorType,
  AddParameterHeaderToTestValidatorType,
  UpdateParameterHeaderToTestValidatorType,
  PartialParameterHeaderToTestValidatorType,
  AddReferenceRangeToParameterValidatorType,
  UpdateReferenceRangeToParameterValidatorType,
  PartialReferenceRangeToParameterValidatorType,
  AddOptionToParameterValidatorType,
  PartialOptionToParameterValidatorType,
  PartialPathologyOrderValidatorType,
  PathologyOrderValidatorType,
  PathologyResultEntryValidatorType,
};
