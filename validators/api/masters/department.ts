import { Status } from "@/generated/prisma/enums";
import { z } from "zod";

const floorBaseValidator = z.object({
  name: z.string().min(1, "Department Name is required"),
  description: z.string().optional().nullable(),
  status: z.enum(Status),
});

const departmentValidator = floorBaseValidator;

const partialDepartmentValidator = floorBaseValidator.partial().extend({
  departmentId: z.coerce.number().min(1, "Department Id is required"),
});

type departmentValidatorType = z.infer<typeof departmentValidator>;
type partialDepartmentValidatorType = z.infer<
  typeof partialDepartmentValidator
>;

export { departmentValidator, partialDepartmentValidator };
export type { departmentValidatorType, partialDepartmentValidatorType };
