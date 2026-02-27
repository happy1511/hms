import { IpdArrival, IpdCareType } from "@/generated/prisma/enums";
import { z } from "zod";
import { patientValidator } from "../masters/patient";
import { invoiceValidator } from "../invoice/invoice";

// -------------------- Ipd Bill --------------------
const ipdBaseValidator = z.object({
  patientId: z.coerce.number().min(1, "Patient is required").optional(),
  patient: patientValidator,
  arrivalState: z.enum(IpdArrival),
  careType: z.enum(IpdCareType).default(IpdCareType["MEDICAL"]),
  remarks: z.string().max(500).optional(),
  bed: z.object({ id: z.coerce.number() }),
  room: z.object({ id: z.coerce.number() }),
  roomType: z.object({ id: z.coerce.number() }),
  department: z.object({ id: z.coerce.number() }),
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
