import { Status } from "@/generated/prisma/enums";
import { z } from "zod";

const bedValidator = z.object({
  countOfBEd: z.number().min(1, "Count of Beds is required"),
  wardId: z.number().min(1, "Ward Id is required"),
});

const partialBedValidator = z.object({
  bedId: z.number().min(1, "Bed Id is required"),
  bedNumber: z.string().min(1, "Bed Name is required").optional(),
  wardId: z.number().min(1, "Ward Id is required").optional(),
  status: z.enum(Status).optional(),
  occupied: z.boolean().optional(),
});

type BedValidatorType = z.infer<typeof bedValidator>;
type PartialBedValidatorType = z.infer<typeof partialBedValidator>;

export { bedValidator, partialBedValidator };
export type { BedValidatorType, PartialBedValidatorType };
