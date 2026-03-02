import {
  ContactType,
  IdentityType,
  IpdArrival,
  IpdCareType,
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

// -------------------- Ipd Bill --------------------
type ipdValidatorType = z.input<typeof ipdValidator>;
type partialIpdValidatorType = z.input<typeof partialIpdValidator>;

export { ipdValidator, partialIpdValidator };
export type { ipdValidatorType, partialIpdValidatorType };
