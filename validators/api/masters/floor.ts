import { Status } from "@/generated/prisma/enums";
import { z } from "zod";

const floorBaseValidator = z.object({
  name: z.string().min(1, "Floor Name is required"),
  description: z.string().optional().nullable(),
  status: z.enum(Status),
});

const floorValidator = floorBaseValidator;

const partialFloorValidator = floorBaseValidator.partial().extend({
  floorId: z.coerce.number().min(1, "Floor Id is required"),
});

type FloorValidatorType = z.infer<typeof floorValidator>;
type PartialFloorValidatorType = z.infer<typeof partialFloorValidator>;

export { floorValidator, partialFloorValidator };
export type { FloorValidatorType, PartialFloorValidatorType };
