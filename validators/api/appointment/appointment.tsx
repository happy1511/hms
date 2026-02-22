import { AppointmentStatus, AppointmentType } from "@/generated/prisma/enums";
import { z } from "zod";

const appointmentValidator = z.object({
  patientId: z.number().min(1, "Patient is required"),
  patientName: z.string().optional(),
  doctor: z.object({ userId: z.number().min(1, "Doctor is required") }),
  type: z.enum(AppointmentType),
  status: z.enum(AppointmentStatus).default(AppointmentStatus.SCHEDULED),
  appointmentDate: z.coerce.date(),
  remarks: z.string().max(500).optional(),
});

const partialAppointmentValidator = appointmentValidator
  .extend({
    appointmentId: z.coerce.number().min(1, "Appointment Id is required"),
  })
  .partial();

type AppointmentValidatorType = z.input<typeof appointmentValidator>;
type PartialAppointmentValidatorType = z.input<
  typeof partialAppointmentValidator
>;

export { appointmentValidator, partialAppointmentValidator };
export type { AppointmentValidatorType, PartialAppointmentValidatorType };
