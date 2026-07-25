import {
  AddressType,
  BloodGroup,
  ContactType,
  Gender,
  IdentityType,
  MaritalStatus,
  MlcInsuranceType,
  NameTitle,
  RelationshipType,
  Status,
} from "@/generated/prisma/enums";
import z from "zod";

const patientAddressLocation = z.object({
  id: z.coerce.number(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postcode: z.string().optional(),
  postName: z.string().optional(),
});

const patientAddress = z.object({
  type: z.enum(AddressType),
  addressLineOne: z.string().min(1, "Address Line One is required"),
  addressLineTwo: z.string().optional().nullable(),
  addressLineThree: z.string().optional().nullable(),
  location: patientAddressLocation,
});

const patientContact = z.object({
  type: z.enum(ContactType),
  value: z.string().min(1, "Please provide value"),
});

const relations = z.object({
  type: z.enum(RelationshipType),
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
  title: z.enum(NameTitle).default(NameTitle["MR"]),
  lastName: z.string().min(1, "Last Name is required"),
  middleName: z.string().nullable(),
  preferredName: z.string().optional().nullable(),
  dob: z.coerce.date().refine((date) => date <= new Date(), {
    message: "Date must be in the past",
  }),
  identificationMark: z.string().nullable(),
  gender: z.enum(Gender),
  maritalStatus: z.enum(MaritalStatus),
  religion: z.string().optional().nullable(),
  bloodGroup: z.enum(BloodGroup),
  isMlcPatient: z.coerce.boolean().optional().default(false),
  mlcInsuranceType: z.enum(MlcInsuranceType).optional().nullable(),
  mlcPolicyOrCardNumber: z.string().optional().nullable(),
  ageYears: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().int().min(0).optional(),
  ).optional(),
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
    uhid: z.string().trim().optional(),
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
type PartialPatientValidatorType = z.input<typeof partialPatientValidator>;
type FindPatientValidatorType = z.input<typeof findPatientValidator>;
type PatientAddressValidatorType = z.input<typeof patientAddress>;
type PatientContactValidatorType = z.input<typeof patientContact>;
type PatientIdentificationValidatorType = z.input<typeof identifications>;
type PatientEmergencyContactValidatorType = z.input<typeof emergencyContact>;
type PatientRelationsValidatorType = z.input<typeof relations>;
type PatientNotesValidatorType = z.input<typeof notes>;
type PatientPersonalValidatorType = z.input<typeof personalValidator>;
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
