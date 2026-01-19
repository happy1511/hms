import { Days, DoctorType } from "@/generated/prisma/enums";
import { z } from "zod";

const doctorValidator = z
  .object({
    name: z.string().min(1, "Name is required"),
    licenseNumber: z.string().min(1, "License Number is required"),
    specialization: z.string().min(1, "Specialization is required"),
    qualifications: z.string().min(1, "Qualification is required"),
    yearsExperience: z.number().min(0, "Experience must be greater than zero"),
    department: z.string().optional(),
    designation: z.string().optional(),
    doctorType: z.enum(DoctorType),
    email: z.email("Invalid email address"),
    phoneNumber: z
      .string()
      .length(10, "Phone Number must be exactly 10 digits"),
    emergencyContact: z
      .string()
      .length(10, "Emergency Contact must be exactly 10 digits")
      .optional(),
    availableDays: z.array(z.enum(Days)).optional(),
    consultationStartingTime: z.date().optional(),
    consultationEndingTime: z.date().optional(),

    loginId: z.string().min(1, "Login ID is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  })
  .superRefine((data, ctx) => {
    if (data.doctorType === DoctorType.consulting) {
      if (!data.emergencyContact) {
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

      if (!data.consultationStartingTime) {
        ctx.addIssue({
          path: ["consultationStartingTime"],
          message: "Consultation start time is required for consulting doctors",
          code: z.ZodIssueCode.custom,
        });
      }

      if (!data.consultationEndingTime) {
        ctx.addIssue({
          path: ["consultationEndingTime"],
          message: "Consultation end time is required for consulting doctors",
          code: z.ZodIssueCode.custom,
        });
      }
    }
  });

const partialDoctorValidator = doctorValidator.partial().extend({
  userId: z.number().min(1, "Doctor Id is required"),
});

type DoctorValidatorType = z.infer<typeof doctorValidator>;
type PartialDoctorValidatorType = z.infer<typeof partialDoctorValidator>;

export { doctorValidator, partialDoctorValidator };
export type { DoctorValidatorType, PartialDoctorValidatorType };
