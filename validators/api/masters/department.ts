import { Status } from "@/generated/prisma/enums";
import { z } from "zod";

const importOptionalText = z.string().optional().default("");

const floorBaseValidator = z.object({
  name: z.string().min(1, "Department Name is required"),
  description: z.string().optional().nullable(),
  status: z.enum(Status),
});

const departmentValidator = floorBaseValidator;

const partialDepartmentValidator = floorBaseValidator.partial().extend({
  departmentId: z.coerce.number().min(1, "Department Id is required"),
});

const departmentImportRowValidator = z.object({
  name: z.string().min(1, "name is required"),
  description: importOptionalText,
  status: z.enum(Status).optional().default(Status.active),
});

type departmentValidatorType = z.infer<typeof departmentValidator>;
type partialDepartmentValidatorType = z.infer<
  typeof partialDepartmentValidator
>;
type DepartmentImportRow = z.infer<typeof departmentImportRowValidator>;

export {
  departmentValidator,
  partialDepartmentValidator,
  departmentImportRowValidator,
};
export type {
  departmentValidatorType,
  partialDepartmentValidatorType,
  DepartmentImportRow,
};
