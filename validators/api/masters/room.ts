import { Status } from "@/generated/prisma/enums";
import { z } from "zod";

const importOptionalText = z.string().optional().default("");

const roomBaseValidator = z.object({
  name: z.string().min(1, "ward Name is required"),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0, "Room price must be greater than or equal to 0"),
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

const roomImportRowValidator = z.object({
  name: z.string().min(1, "name is required"),
  roomTypeName: z.string().min(1, "roomTypeName is required"),
  price: z.coerce
    .number()
    .min(0, "price must be greater than or equal to 0"),
  description: importOptionalText,
  status: z.enum(Status).optional().default(Status.active),
});

type roomValidatorType = z.input<typeof roomValidator>;
type PartialRoomValidatorType = z.input<typeof partialRoomValidator>;
type RoomImportRow = z.infer<typeof roomImportRowValidator>;

export { roomValidator, partialRoomValidator, roomImportRowValidator };
export type { roomValidatorType, PartialRoomValidatorType, RoomImportRow };
