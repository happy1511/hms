import {
  Days,
  DoctorType,
  Gender,
  NameTitle,
  Status,
} from "@/generated/prisma/enums";
import { z } from "zod";

const optionalText = z.string().optional().or(z.literal(""));
const importOptionalNumberText = z.string().optional().default("");
const optionalPhone = z
  .string()
  .regex(/^\d{10}$/, "Phone Number must be exactly 10 digits")
  .optional()
  .or(z.literal(""));

const doctorBaseValidator = z.object({
  title: z.enum(NameTitle).optional(),
  firstName: z.string().min(1, "First Name is required"),
  middleName: optionalText,
  lastName: optionalText,
  gender: z.enum(Gender).optional(),
  userType: z.string().optional().default("Doctor"),
  doctorType: z.enum(DoctorType),
  licenseNumber: optionalText,
  specialization: optionalText,
  qualifications: optionalText,
  yearsExperience: z.coerce.number().min(0).optional(),
  department: optionalText,
  designation: optionalText,
  consultationCharges: z.coerce.number().min(0).optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  phoneNumber: optionalPhone,
  contactNumber: optionalPhone,
  emergencyContact: optionalPhone,
  consultationStartingTime: optionalText,
  consultationEndingTime: optionalText,
  status: z.enum(Status).optional().default(Status.active),
  availableDays: z
    .array(z.object({ day: z.enum(Days), available: z.boolean() }))
    .optional(),
});

const doctorValidator = doctorBaseValidator.superRefine((data, ctx) => {
  if (data.doctorType === DoctorType.consulting) {
    if (!data.title) {
      ctx.addIssue({
        path: ["title"],
        message: "Title is required for consulting doctors",
        code: z.ZodIssueCode.custom,
      });
    }
    if (!data.lastName || !data.lastName.trim()) {
      ctx.addIssue({
        path: ["lastName"],
        message: "Last Name is required for consulting doctors",
        code: z.ZodIssueCode.custom,
      });
    }
    if (!data.gender) {
      ctx.addIssue({
        path: ["gender"],
        message: "Gender is required for consulting doctors",
        code: z.ZodIssueCode.custom,
      });
    }
    if (!data.userType || !data.userType.trim()) {
      ctx.addIssue({
        path: ["userType"],
        message: "User Type is required for consulting doctors",
        code: z.ZodIssueCode.custom,
      });
    }
  }
});

const partialDoctorValidator = doctorBaseValidator.partial().extend({
  doctorId: z.coerce.number().optional(),
  userId: z.coerce.number().optional(),
});

const doctorImportRowValidator = z.object({
  title: z.enum(NameTitle).optional().default(NameTitle.DR),
  firstName: z.string().min(1, "firstName is required"),
  middleName: optionalText,
  lastName: optionalText,
  gender: z.enum(Gender).optional(),
  status: z.enum(Status).optional().default(Status.active),
  licenseNumber: optionalText,
  specialization: optionalText,
  qualifications: optionalText,
  department: optionalText,
  yearsExperience: importOptionalNumberText,
  designation: optionalText,
  doctorType: z.enum(DoctorType),
  consultationCharges: importOptionalNumberText,
  emergencyContact: optionalText,
  availableDays: optionalText,
  consultationStartingTime: optionalText,
  consultationEndingTime: optionalText,
});

type DoctorValidatorType = z.input<typeof doctorValidator>;
type PartialDoctorValidatorType = z.output<typeof partialDoctorValidator>;
type DoctorImportRow = z.infer<typeof doctorImportRowValidator>;

export { doctorValidator, partialDoctorValidator, doctorImportRowValidator };
export type {
  DoctorValidatorType,
  PartialDoctorValidatorType,
  DoctorImportRow,
};
