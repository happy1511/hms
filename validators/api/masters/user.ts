import {
  Gender,
  IdentityType,
  MaritalStatus,
  NameTitle,
  Status,
} from "@/generated/prisma/enums";
import { z } from "zod";

const permissionValidator = z.array(
  z.object({
    module: z.object({
      name: z.string(),
      id: z.string().min(1, "ModuleId is required"),
    }),
    actions: z.array(
      z.object({ id: z.string(), assigned: z.boolean(), name: z.string() }),
    ),
  }),
);

const optionalText = z.string().optional().or(z.literal(""));
const optionalDate = z.coerce.date().optional();

const userValidator = z.object({
  title: z.enum(NameTitle),
  firstName: z.string().trim().min(1, "First name is required"),
  middleName: optionalText,
  lastName: z.string().trim().min(1, "Last name is required"),
  preferredName: z.string().trim().min(1, "Preferred name is required"),
  gender: z.enum(Gender),
  dob: optionalDate,
  maritalStatus: z.enum(MaritalStatus).optional(),
  address: optionalText,
  city: optionalText,
  country: optionalText,
  state: optionalText,
  postcode: optionalText,
  contactNumber: z
    .string()
    .regex(/^\d{10}$/, "Contact number must be a 10-digit phone number"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  identityType: z.enum(IdentityType).optional(),
  identityNumber: optionalText,
  education: optionalText,
  qualifications: optionalText,
  department: optionalText,
  password: z.string().min(6, "Password must be at least 6 characters long"),
  status: z.enum(Status),
  permissions: permissionValidator,
});

const partialUserValidator = userValidator.partial().extend({
  id: z.coerce.number().min(1, "User Id is required"),
});

type UserValidatorType = z.infer<typeof userValidator>;
type PartialUserValidatorType = z.infer<typeof partialUserValidator>;

export { userValidator, partialUserValidator };
export type { UserValidatorType, PartialUserValidatorType };
