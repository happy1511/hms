import { Status } from "@/generated/prisma/enums";
import { z } from "zod";

const importOptionalText = z.string().optional().default("");

const bedValidator = z.object({
  countOfBEd: z.number().min(1, "Count of Beds is required"),
  room: z.object({
    id: z.coerce.number().min(1),
    name: z.string().min(1, "Ward name is required"),
  }),
});

const partialBedValidator = z.object({
  bedId: z.number().min(1, "Bed Id is required"),
  bedNumber: z.string().min(1, "Bed Name is required").optional(),
  room: z
    .object({
      id: z.coerce.number().min(1),
      name: z.string().min(1, "Ward name is required"),
    })
    .optional(),
  status: z.enum(Status).optional(),
  occupied: z.boolean().optional(),
});

const bedImportRowValidator = z.object({
  roomName: z.string().min(1, "roomName is required"),
  bedNumber: z.string().min(1, "bedNumber is required"),
  name: importOptionalText,
  status: z.enum(Status).optional().default(Status.active),
});

type BedValidatorType = z.input<typeof bedValidator>;
type PartialBedValidatorType = z.input<typeof partialBedValidator>;
type BedImportRow = z.infer<typeof bedImportRowValidator>;

export { bedValidator, partialBedValidator, bedImportRowValidator };
export type { BedValidatorType, PartialBedValidatorType, BedImportRow };
