import {
  Days,
  DoctorType,
  Gender,
  NameTitle,
  Status,
} from "@/generated/prisma/enums";
import { z } from "zod";
import { userValidator } from "./user";

const optionalText = z.string().optional().or(z.literal(""));
const importOptionalNumberText = z.string().optional().default("");
const optionalPhone = z
  .string()
  .regex(/^\d{10}$/, "Phone Number must be exactly 10 digits")
  .optional()
  .or(z.literal(""));

const doctorBaseValidator = userValidator.extend({
  password: z.string().min(6).optional().or(z.literal("")),
  status: z.enum(Status).optional().default(Status.active),
  permissions: userValidator.shape.permissions.optional().default([]),
  title: z.enum(NameTitle).default(NameTitle["DR"]).optional(),
  licenseNumber: optionalText,
  specialization: optionalText,
  yearsExperience: z.number().min(0, "Experience must be greater than zero").optional(),
  designation: optionalText,
  doctorType: z.enum(DoctorType),
  consultationCharges: z.coerce.number().min(0, "Consultation charges must be greater than or equal to 0").optional(),
  emergencyContact: optionalPhone,
  availableDays: z
    .array(z.object({ day: z.enum(Days), available: z.boolean() }))
    .optional(),
  consultationStartingTime: optionalText,
  consultationEndingTime: optionalText,
});

const doctorValidator = doctorBaseValidator.superRefine((data, ctx) => {
  if (data.doctorType === DoctorType.consulting) {
    if (!data.password || !data.password.trim()) {
      ctx.addIssue({
        path: ["password"],
        message: "Password is required for consulting doctors",
        code: z.ZodIssueCode.custom,
      });
    }

    if (!data.licenseNumber || !data.licenseNumber.trim()) {
      ctx.addIssue({
        path: ["licenseNumber"],
        message: "License Number is required for consulting doctors",
        code: z.ZodIssueCode.custom,
      });
    }

    if (!data.specialization || !data.specialization.trim()) {
      ctx.addIssue({
        path: ["specialization"],
        message: "Specialization is required for consulting doctors",
        code: z.ZodIssueCode.custom,
      });
    }

    if (!data.qualifications || !data.qualifications.trim()) {
      ctx.addIssue({
        path: ["qualifications"],
        message: "Qualification is required for consulting doctors",
        code: z.ZodIssueCode.custom,
      });
    }

    if (data.yearsExperience === undefined) {
      ctx.addIssue({
        path: ["yearsExperience"],
        message: "Experience is required for consulting doctors",
        code: z.ZodIssueCode.custom,
      });
    }

    if (!data.email || !data.email.trim()) {
      ctx.addIssue({
        path: ["email"],
        message: "Email is required for consulting doctors",
        code: z.ZodIssueCode.custom,
      });
    }

    if (!data.contactNumber || !data.contactNumber.trim()) {
      ctx.addIssue({
        path: ["contactNumber"],
        message: "Contact number is required for consulting doctors",
        code: z.ZodIssueCode.custom,
      });
    }

    if (!data.emergencyContact || !data.emergencyContact.trim()) {
      ctx.addIssue({
        path: ["emergencyContact"],
        message: "Emergency contact is required for consulting doctors",
        code: z.ZodIssueCode.custom,
      });
    }

    if (!data.availableDays || data.availableDays.length === 0) {
      ctx.addIssue({
        path: ["availableDays"],
        message: "Available days are required for consulting doctors",
        code: z.ZodIssueCode.custom,
      });
    }

    if (!data.consultationStartingTime || !data.consultationStartingTime.trim()) {
      ctx.addIssue({
        path: ["consultationStartingTime"],
        message: "Consultation start time is required for consulting doctors",
        code: z.ZodIssueCode.custom,
      });
    }

    if (!data.consultationEndingTime || !data.consultationEndingTime.trim()) {
      ctx.addIssue({
        path: ["consultationEndingTime"],
        message: "Consultation end time is required for consulting doctors",
        code: z.ZodIssueCode.custom,
      });
    }

    if (data.consultationCharges === undefined) {
      ctx.addIssue({
        path: ["consultationCharges"],
        message: "Consultation charges are required for consulting doctors",
        code: z.ZodIssueCode.custom,
      });
    }
  }
});

const partialDoctorValidator = doctorBaseValidator.partial().extend({
  userId: z.coerce.number().min(1, "Doctor Id is required"),
});

const doctorImportRowValidator = z.object({
  title: z.enum(NameTitle).optional().default(NameTitle.DR),
  firstName: z.string().min(1, "firstName is required"),
  middleName: optionalText,
  lastName: z.string().min(1, "lastName is required"),
  preferredName: z.string().min(1, "preferredName is required"),
  gender: z.enum(Gender),
  dob: optionalText,
  locationId: importOptionalNumberText,
  contactNumber: z
    .string()
    .regex(/^\d{10}$/, "contactNumber must be exactly 10 digits"),
  email: optionalText,
  password: optionalText,
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
