import { Status } from "@/generated/prisma/enums";
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

const userValidator = z.object({
  name: z.string().min(1, "Name is required"),
  loginId: z.string().optional(),
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
