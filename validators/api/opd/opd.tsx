import {
  AddressType,
  ContactType,
  IdentityType,
  OpdArrival,
  OpdStatus,
  RelationshipType,
  Status,
} from "@/generated/prisma/enums";
import { z } from "zod";
import { patientValidator } from "../masters/patient";
import { invoiceValidator } from "../invoice/invoice";

const opdPatientValidator = patientValidator.extend({
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

// -------------------- Opd Bill --------------------
const opdBaseValidator = z.object({
  patientId: z.coerce.number().min(1, "Patient is required").optional(),
  patient: opdPatientValidator.superRefine((data, ctx) => {
    if (!data.contacts.find((c) => c.type === ContactType.PHONE)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Phone Number is required`,
        path: ["contacts", 0, "value"],
      });
    }
  }),
  arrivalState: z.enum(OpdArrival),
  remarks: z.string().max(500).optional(),
  consultantDoctor: z
    .object({ userId: z.coerce.number() })
    .superRefine((data, ctx) => {
      if (!data.userId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Consultant is required`,
        });
      }
    }),
  referredDoctor: z.object({ userId: z.coerce.number() }).optional(),
  invoice: invoiceValidator,
});

const opdValidator = opdBaseValidator;
const partialOpdValidator = opdBaseValidator.partial().extend({
  opdId: z.coerce.number(),
});

// -------------------- Opd Updates --------------------
const opdStatusUpdateValidator = z.object({
  opdId: z.coerce.number(),
  status: z.enum(OpdStatus),
});

const opdDateTimeUpdateValidator = z.object({
  opdId: z.coerce.number(),
  opdDateTime: z.coerce.date(),
});

// -------------------- Opd File --------------------
const vitalsValidator = z.object({
  height: z.coerce.number().optional(),
  weight: z.coerce.number().optional(),
  bpMm: z.coerce.number().optional(),
  bpHg: z.coerce.number().optional(),
  pulse: z.coerce.number().optional(),
  rbs: z.coerce.number().optional(),
  rr: z.coerce.number().optional(),
  spo2: z.coerce.number().optional(),
  temp: z.coerce.number().optional(),
  opdId: z.coerce.number(),
});

const consultationValidator = z.object({
  notes: z.string().optional().nullable(),
  generalExaminations: z.string().optional().nullable(),
  systemicExaminations: z.string().optional().nullable(),
  diagnosis: z.string().optional().nullable(),
  chronicIllness: z.string().optional().nullable(),
  advisedPathologyTests: z
    .array(z.object({ id: z.coerce.number() }))
    .optional()
    .nullable(),
  advisedRadiologyTests: z
    .array(z.object({ id: z.coerce.number() }))
    .optional()
    .nullable(),
});

const prescribedDrugValidator = z.object({
  index: z.coerce.number().optional().nullable(),
  name: z.string().min(1),
  days: z.coerce.number().min(1),
  frequency: z.coerce.number().min(1),
  remarks: z.string().optional().nullable(),
});

const prescriptionValidator = z.object({
  followUpAfterDays: z.coerce.number().optional().nullable(),
  followUpDate: z.coerce.date().optional().nullable(),
  followUpAdvice: z.string().optional().nullable(),
  otherAdvice: z.string().optional().nullable(),
  drugs: z.array(prescribedDrugValidator),
  opdId: z.coerce.number(),
});

const consultationFileValidator = consultationValidator.extend({
  prescription: prescriptionValidator,
  vitals: vitalsValidator,
  opdId: z.coerce.number(),
});

// -------------------- Opd Doctor Update --------------------
const opdDoctorUpdateValidator = z
  .object({
    opdId: z.coerce.number(),
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

// -------------------- Opd Bill --------------------
type opdValidatorType = z.input<typeof opdValidator>;
type partialOpdValidatorType = z.input<typeof partialOpdValidator>;
type opdStatusUpdateValidatorType = z.input<typeof opdStatusUpdateValidator>;
type opdDateTimeUpdateValidatorType = z.input<typeof opdDateTimeUpdateValidator>;

// -------------------- Opd File --------------------
type vitalValidatorType = z.input<typeof vitalsValidator>;
type consultantFileType = z.input<typeof consultationFileValidator>;
type prescribedDrugType = z.input<typeof prescribedDrugValidator>;
type opdDoctorUpdateValidatorType = z.input<typeof opdDoctorUpdateValidator>;

export {
  opdValidator,
  partialOpdValidator,
  opdStatusUpdateValidator,
  opdDateTimeUpdateValidator,
  vitalsValidator,
  consultationFileValidator,
  prescribedDrugValidator,
  opdDoctorUpdateValidator,
};
export type {
  opdValidatorType,
  partialOpdValidatorType,
  opdStatusUpdateValidatorType,
  opdDateTimeUpdateValidatorType,
  vitalValidatorType,
  consultantFileType,
  prescribedDrugType,
  opdDoctorUpdateValidatorType,
};
