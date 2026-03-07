import { Days, DoctorType, NameTitle, Status } from "@/generated/prisma/enums";
import { z } from "zod";
import { userValidator } from "./user";

const optionalText = z.string().optional().or(z.literal(""));
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
  }
});

const partialDoctorValidator = doctorBaseValidator.partial().extend({
  userId: z.coerce.number().min(1, "Doctor Id is required"),
});

type DoctorValidatorType = z.input<typeof doctorValidator>;
type PartialDoctorValidatorType = z.output<typeof partialDoctorValidator>;

export { doctorValidator, partialDoctorValidator };
export type { DoctorValidatorType, PartialDoctorValidatorType };
