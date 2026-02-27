import { Status } from "@/generated/prisma/enums";
import { z } from "zod";

const roomBaseValidator = z.object({
  name: z.string().min(1, "ward Name is required"),
  description: z.string().optional().nullable(),
  roomType: z
    .object({
      id: z.coerce.number(),
    })
    .optional(),
  status: z.enum(Status),
});

const roomValidator = roomBaseValidator.superRefine((values, ctx) => {
  if (!values.roomType?.id) {
    ctx.addIssue({
      path: ["roomType"],
      message: "Select Any of room type",
      code: z.ZodIssueCode.custom,
    });
  }
});

const partialRoomValidator = roomBaseValidator.partial().extend({
  roomId: z.coerce.number().min(1, "Room Id is required"),
});

type roomValidatorType = z.input<typeof roomValidator>;
type PartialRoomValidatorType = z.input<typeof partialRoomValidator>;

export { roomValidator, partialRoomValidator };
export type { roomValidatorType, PartialRoomValidatorType };
