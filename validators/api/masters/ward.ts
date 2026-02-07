import { Status } from "@/generated/prisma/enums";
import { z } from "zod";

const wardBaseValidator = z.object({
  name: z.string().min(1, "ward Name is required"),
  description: z.string().optional().nullable(),
  floorId: z.number().optional(),
  status: z.enum(Status),
});

const wardValidator = wardBaseValidator.superRefine((values, ctx) => {
  if (!values.floorId) {
    ctx.addIssue({
      path: ["floorId"],
      message: "Select Any of floor",
      code: z.ZodIssueCode.custom,
    });
  }
});

const partialWardValidator = wardBaseValidator.partial().extend({
  wardId: z.coerce.number().min(1, "ward Id is required"),
});

type WardValidatorType = z.infer<typeof wardValidator>;
type PartialWardValidatorType = z.infer<typeof partialWardValidator>;

export { wardValidator, partialWardValidator };
export type { WardValidatorType, PartialWardValidatorType };
