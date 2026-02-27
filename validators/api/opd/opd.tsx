import { OpdArrival } from "@/generated/prisma/enums";
import { z } from "zod";
import { patientValidator } from "../masters/patient";
import { invoiceValidator } from "../invoice/invoice";

// -------------------- Opd Bill --------------------
const opdBaseValidator = z.object({
  patientId: z.coerce.number().min(1, "Patient is required").optional(),
  patient: patientValidator,
  arrivalState: z.enum(OpdArrival),
  remarks: z.string().max(500).optional(),
  consultantDoctor: z.object({ userId: z.coerce.number() }),
  referredDoctor: z.object({ userId: z.coerce.number() }).optional(),
  invoice: invoiceValidator,
});

const opdValidator = opdBaseValidator;

const partialOpdValidator = opdBaseValidator.partial().extend({
  opdId: z.coerce.number(),
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

// -------------------- Opd Bill --------------------
type opdValidatorType = z.input<typeof opdValidator>;
type partialOpdValidatorType = z.input<typeof partialOpdValidator>;

// -------------------- Opd File --------------------
type vitalValidatorType = z.input<typeof vitalsValidator>;
type consultantFileType = z.input<typeof consultationFileValidator>;
type prescribedDrugType = z.input<typeof prescribedDrugValidator>;

export {
  opdValidator,
  partialOpdValidator,
  vitalsValidator,
  consultationFileValidator,
  prescribedDrugValidator,
};
export type {
  opdValidatorType,
  partialOpdValidatorType,
  vitalValidatorType,
  consultantFileType,
  prescribedDrugType,
};
