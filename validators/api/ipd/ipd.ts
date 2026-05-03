import {
  AddressType,
  ContactType,
  IdentityType,
  IpdArrival,
  IpdCareType,
  MlcInsuranceType,
  PaymentCategory,
  RelationshipType,
  Status,
} from "@/generated/prisma/enums";
import { z } from "zod";
import { patientValidator } from "../masters/patient";
import { invoiceValidator } from "../invoice/invoice";

const ipdPatientValidator = patientValidator.extend({
  addresses: z.array(
    z.object({
      type: z.enum(AddressType),
      addressLineOne: z.string().optional().nullable(),
      addressLineTwo: z.string().optional().nullable(),
      addressLineThree: z.string().optional().nullable(),
      location: z.object({ id: z.coerce.number() }).optional().nullable(),
    }),
  ),
  contacts: z.array(
    z.object({
      type: z.enum(ContactType),
      value: z.string().optional().nullable(),
    }),
  ),
  relations: z.array(
    z.object({
      type: z.enum(RelationshipType).optional().nullable(),
      name: z.string().optional().nullable(),
      contact: z.string().optional().nullable(),
    }),
  ),
  identifications: z.array(
    z.object({
      type: z.enum(IdentityType),
      number: z.string().optional().nullable(),
      active: z.enum(Status),
    }),
  ),
});

// -------------------- Ipd Bill --------------------
const ipdBaseValidator = z.object({
  patientId: z.coerce.number().min(1, "Patient is required").optional(),
  patient: ipdPatientValidator,
  arrivalState: z.enum(IpdArrival),
  careType: z.enum(IpdCareType).default(IpdCareType["MEDICAL"]),
  isDayCare: z.coerce.boolean().optional().default(false),
  remarks: z.string().max(500).optional(),
  bed: z.object({ id: z.coerce.number() }),
  room: z.object({ id: z.coerce.number() }).optional(),
  roomType: z.object({ id: z.coerce.number() }).optional(),
  department: z.object({ id: z.coerce.number() }).optional(),
  consultantDoctor: z.object({ userId: z.coerce.number() }),
  referredDoctor: z.object({ userId: z.coerce.number() }).optional(),
  invoice: invoiceValidator,
});

const ipdValidator = ipdBaseValidator;

const partialIpdValidator = ipdBaseValidator.partial().extend({
  ipdId: z.coerce.number(),
});

// -------------------- Ipd Updates --------------------
const ipdDoctorUpdateValidator = z
  .object({
    ipdId: z.coerce.number(),
    consultantDoctor: z.object({ userId: z.coerce.number() }).optional(),
    referredDoctor: z
      .object({ userId: z.coerce.number() })
      .optional()
      .nullable(),
  })
  .superRefine((data, ctx) => {
    if (!data.consultantDoctor && !data.referredDoctor) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one doctor change is required",
      });
    }
  });

const ipdBillingTypeUpdateValidator = z.object({
  ipdId: z.coerce.number(),
  billingType: z.enum(PaymentCategory),
});

const ipdBedUpdateValidator = z.object({
  ipdId: z.coerce.number(),
  bedId: z.coerce.number(),
});

const ipdDateTimeUpdateValidator = z.object({
  ipdId: z.coerce.number(),
  ipdDateTime: z.coerce.date(),
});

const ipdMlcDeclareValidator = z.object({
  ipdId: z.coerce.number(),
  isMlcPatient: z.coerce.boolean().optional().default(true),
  mlcInsuranceType: z.enum(MlcInsuranceType).optional().nullable(),
  mlcPolicyOrCardNumber: z.string().optional().nullable(),
});

// -------------------- Ipd Discharge Summary --------------------
const ipdDischargeDrugValidator = z.object({
  index: z.coerce.number().optional().nullable(),
  drugId: z.coerce.number().min(1, "Drug is required"),
  days: z.coerce.number().min(1),
  frequency: z.coerce.number().min(1),
  unit: z.string().optional().nullable(),
  route: z.string().min(1, "Route is required"),
  remarks: z.string().optional().nullable(),
});

const ipdDischargeSummaryValidator = z.object({
  ipdId: z.coerce.number(),
  ipdDateTime: z.coerce.date().optional().nullable(),
  isUnfitForFurtherManagement: z.coerce.boolean().optional().default(false),
  diagnosis: z.string().optional().nullable(),
  procedureDate: z.coerce.date().optional().nullable(),
  procedure: z.string().optional().nullable(),
  courseInHospital: z.string().optional().nullable(),
  investigationResults: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  diet: z.string().optional().nullable(),
  physicalActivity: z.string().optional().nullable(),
  followUpAfterDays: z.coerce.number().optional().nullable(),
  followUpDate: z.coerce.date().optional().nullable(),
  followUpAdvice: z.string().optional().nullable(),
  otherAdvice: z.string().optional().nullable(),
  urgentCareWhen: z.string().optional().nullable(),
  isTransferred: z.coerce.boolean().optional().default(false),
  remarks: z.string().optional().nullable(),
  drugs: z.array(ipdDischargeDrugValidator).optional().default([]),
});

// -------------------- Ipd Bill --------------------
type ipdValidatorType = z.input<typeof ipdValidator>;
type partialIpdValidatorType = z.input<typeof partialIpdValidator>;
type ipdDoctorUpdateValidatorType = z.input<typeof ipdDoctorUpdateValidator>;
type ipdBillingTypeUpdateValidatorType = z.input<
  typeof ipdBillingTypeUpdateValidator
>;
type ipdBedUpdateValidatorType = z.input<typeof ipdBedUpdateValidator>;
type ipdDateTimeUpdateValidatorType = z.input<typeof ipdDateTimeUpdateValidator>;
type ipdMlcDeclareValidatorType = z.input<typeof ipdMlcDeclareValidator>;
type ipdDischargeDrugValidatorType = z.input<typeof ipdDischargeDrugValidator>;
type ipdDischargeSummaryValidatorType = z.input<
  typeof ipdDischargeSummaryValidator
>;

export {
  ipdValidator,
  partialIpdValidator,
  ipdDoctorUpdateValidator,
  ipdBillingTypeUpdateValidator,
  ipdBedUpdateValidator,
  ipdDateTimeUpdateValidator,
  ipdMlcDeclareValidator,
  ipdDischargeDrugValidator,
  ipdDischargeSummaryValidator,
};
export type {
  ipdValidatorType,
  partialIpdValidatorType,
  ipdDoctorUpdateValidatorType,
  ipdBillingTypeUpdateValidatorType,
  ipdBedUpdateValidatorType,
  ipdDateTimeUpdateValidatorType,
  ipdMlcDeclareValidatorType,
  ipdDischargeDrugValidatorType,
  ipdDischargeSummaryValidatorType,
};
