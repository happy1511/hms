import {
  ContactType,
  IdentityType,
  IpdArrival,
  IpdCareType,
  PaymentCategory,
  RelationshipType,
  Status,
} from "@/generated/prisma/enums";
import { z } from "zod";
import { patientValidator } from "../masters/patient";
import { invoiceValidator } from "../invoice/invoice";

const ipdPatientValidator = patientValidator.extend({
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

// -------------------- Ipd Bill --------------------
type ipdValidatorType = z.input<typeof ipdValidator>;
type partialIpdValidatorType = z.input<typeof partialIpdValidator>;
type ipdDoctorUpdateValidatorType = z.input<typeof ipdDoctorUpdateValidator>;
type ipdBillingTypeUpdateValidatorType = z.input<
  typeof ipdBillingTypeUpdateValidator
>;
type ipdBedUpdateValidatorType = z.input<typeof ipdBedUpdateValidator>;
type ipdDateTimeUpdateValidatorType = z.input<typeof ipdDateTimeUpdateValidator>;

export {
  ipdValidator,
  partialIpdValidator,
  ipdDoctorUpdateValidator,
  ipdBillingTypeUpdateValidator,
  ipdBedUpdateValidator,
  ipdDateTimeUpdateValidator,
};
export type {
  ipdValidatorType,
  partialIpdValidatorType,
  ipdDoctorUpdateValidatorType,
  ipdBillingTypeUpdateValidatorType,
  ipdBedUpdateValidatorType,
  ipdDateTimeUpdateValidatorType,
};
