import {
  BloodGroup,
  ContactType,
  Gender,
  IdentityType,
  MaritalStatus,
  Status,
} from "@/generated/prisma/enums";
import z from "zod";

const patientAddress = z.object({
  type: z.string().min(1, "Type is required"),
  country: z.string().min(1, "Country is required"),
  addressLineOne: z.string().min(1, "Address Line One is required"),
  addressLineTwo: z.string().optional().nullable(),
  addressLineThree: z.string().optional().nullable(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal Code is required"),
});

const patientContact = z.object({
  type: z.enum(ContactType),
  value: z.string().min(1, "Please provide value"),
});

const relations = z.object({
  type: z.string().min(1, "Relation type is required"),
  name: z.string().min(1, "Name is required"),
  contact: z.string().optional().nullable(),
});

const identifications = z.object({
  type: z.enum(IdentityType),
  number: z.string().min(1, "Identification number is required"),
  active: z.enum(Status),
});

const identificationsValidator = z.object({
  patientId: z.coerce.number(),
  type: z.enum(IdentityType),
  number: z.string().min(1, "Identification number is required"),
  active: z.enum(Status),
});

const notes = z.object({
  type: z.string().min(1, "Note type is required"),
  note: z.string().min(1, "Note is required"),
});

const emergencyContact = z.object({
  relation: z.string().min(1, "Relation type is required"),
  name: z.string().min(1, "Name is required"),
  contact: z.string().min(1, "Contact is required"),
  email: z.string().email().nullable(),
});

const personalValidator = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  middleName: z.string().nullable(),
  preferredName: z.string().min(1, "Preferred Name is required"),
  dob: z.coerce.date().refine((date) => date <= new Date(), {
    message: "Date must be in the past",
  }),
  identificationMark: z.string().nullable(),
  gender: z.enum(Gender),
  maritalStatus: z.enum(MaritalStatus),
  religion: z.string().min(1, "Religion is required"),
  bloodGroup: z.enum(BloodGroup),
});

const patientValidator = personalValidator.extend({
  addresses: z.array(patientAddress),
  contacts: z.array(patientContact),
  relations: z.array(relations),
  identifications: z.array(identifications),
  emergencyContacts: z.array(emergencyContact),
  notes: z.array(notes),
});

const withId = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) =>
  schema.extend({
    id: z.coerce.number().optional(),
  });

const partialPatientValidator = patientValidator.partial().extend({
  patientId: z.coerce.number(),
  dob: z.coerce
    .date()
    .optional()
    .refine((date) => date && date <= new Date(), {
      message: "Date must be in the past",
    }),
  addresses: z.array(withId(patientAddress)).optional(),
  contacts: z.array(withId(patientContact)).optional(),
  relations: z.array(withId(relations)).optional(),
  identifications: z.array(withId(identifications)).optional(),
  emergencyContacts: z.array(withId(emergencyContact)).optional(),
  notes: z.array(withId(notes)).optional(),
});

const findPatientValidator = z
  .object({
    uhid: z.string().optional(),
    name: z.string().optional(),
    contactNo: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (!(values.contactNo || values.name || values.uhid)) {
      ctx.addIssue({
        path: ["contactNo"],
        message: "Provide any of these values",
        code: z.ZodIssueCode.custom,
      });
      ctx.addIssue({
        path: ["uhid"],
        message: "Provide any of these values",
        code: z.ZodIssueCode.custom,
      });
      ctx.addIssue({
        path: ["name"],
        message: "Provide any of these values",
        code: z.ZodIssueCode.custom,
      });
    }
  });

type PatientValidatorType = z.input<typeof patientValidator>;
type PartialPatientValidatorType = z.infer<typeof partialPatientValidator>;
type FindPatientValidatorType = z.infer<typeof findPatientValidator>;
type PatientAddressValidatorType = z.infer<typeof patientAddress>;
type PatientContactValidatorType = z.infer<typeof patientContact>;
type PatientIdentificationValidatorType = z.infer<typeof identifications>;
type PatientEmergencyContactValidatorType = z.infer<typeof emergencyContact>;
type PatientRelationsValidatorType = z.infer<typeof relations>;
type PatientNotesValidatorType = z.infer<typeof notes>;
type PatientPersonalValidatorType = z.infer<typeof personalValidator>;
type PatientIdentificationsValidatorType = z.input<
  typeof identificationsValidator
>;

export {
  patientValidator,
  patientAddress,
  partialPatientValidator,
  findPatientValidator,
  patientContact,
  identifications,
  emergencyContact,
  relations,
  notes,
  personalValidator,
  identificationsValidator,
};
export type {
  FindPatientValidatorType,
  PatientValidatorType,
  PartialPatientValidatorType,
  PatientAddressValidatorType,
  PatientContactValidatorType,
  PatientIdentificationValidatorType,
  PatientEmergencyContactValidatorType,
  PatientRelationsValidatorType,
  PatientNotesValidatorType,
  PatientPersonalValidatorType,
  PatientIdentificationsValidatorType,
};
