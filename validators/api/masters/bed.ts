import { Status } from "@/generated/prisma/enums";
import { z } from "zod";

const bedValidator = z.object({
  countOfBEd: z.number().min(1, "Count of Beds is required"),
  ward: z.object({
    id: z.coerce.number().min(1),
    name: z.string().min(1, "Ward name is required"),
  }),
});

const partialBedValidator = z.object({
  bedId: z.number().min(1, "Bed Id is required"),
  bedNumber: z.string().min(1, "Bed Name is required").optional(),
  ward: z
    .object({
      id: z.coerce.number().min(1),
      name: z.string().min(1, "Ward name is required"),
    })
    .optional(),
  status: z.enum(Status).optional(),
  occupied: z.boolean().optional(),
});

type BedValidatorType = z.input<typeof bedValidator>;
type PartialBedValidatorType = z.input<typeof partialBedValidator>;

export { bedValidator, partialBedValidator };
export type { BedValidatorType, PartialBedValidatorType };
