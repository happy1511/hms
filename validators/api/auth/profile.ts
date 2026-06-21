import {
  Gender,
  IdentityType,
  MaritalStatus,
  NameTitle,
} from "@/generated/prisma/enums";
import { z } from "zod";

const optionalText = z.string().optional().or(z.literal(""));
const profileLocation = z
  .object({
    id: z.coerce.number(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    postcode: z.string().optional(),
    postName: z.string().optional(),
  })
  .optional()
  .nullable();

export const profileUpdateValidator = z.object({
  title: z.enum(NameTitle),
  firstName: z.string().trim().min(1, "First name is required"),
  middleName: optionalText,
  lastName: z.string().trim().min(1, "Last name is required"),
  preferredName: z.string().trim().min(1, "Preferred name is required"),
  gender: z.enum(Gender),
  dob: z.coerce.date().optional(),
  maritalStatus: z.enum(MaritalStatus).optional(),
  location: profileLocation,
  contactNumber: z
    .string()
    .regex(/^\d{10}$/, "Contact number must be a 10-digit phone number"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  identityType: z.enum(IdentityType).optional(),
  identityNumber: optionalText,
  qualifications: optionalText,
  department: optionalText,
});

export const changePasswordValidator = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters long"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type ProfileUpdateValidatorType = z.infer<typeof profileUpdateValidator>;
export type ChangePasswordValidatorType = z.infer<typeof changePasswordValidator>;
