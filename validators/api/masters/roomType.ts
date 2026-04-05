import { Status } from "@/generated/prisma/enums";
import { z } from "zod";

const importOptionalText = z.string().optional().default("");

const roomTypeBaseValidator = z.object({
  name: z.string().min(1, "Room Type Name is required"),
  description: z.string().optional().nullable(),
  department: z
    .object({
      id: z.coerce.number(),
    })
    .optional(),
  status: z.enum(Status),
});

const roomTypeValidator = roomTypeBaseValidator.superRefine((values, ctx) => {
  if (!values.department?.id) {
    ctx.addIssue({
      path: ["department"],
      message: "Select Any of department",
      code: z.ZodIssueCode.custom,
    });
  }
});

const partialRoomTypeValidator = roomTypeBaseValidator.partial().extend({
  typeId: z.coerce.number().min(1, "room type Id is required"),
});

const roomTypeImportRowValidator = z.object({
  name: z.string().min(1, "name is required"),
  departmentName: z.string().min(1, "departmentName is required"),
  description: importOptionalText,
  status: z.enum(Status).optional().default(Status.active),
});

type RoomTypeValidatorType = z.input<typeof roomTypeValidator>;
type PartialRoomTypeValidatorType = z.input<typeof partialRoomTypeValidator>;
type RoomTypeImportRow = z.infer<typeof roomTypeImportRowValidator>;

export {
  roomTypeValidator,
  partialRoomTypeValidator,
  roomTypeImportRowValidator,
};
export type {
  RoomTypeValidatorType,
  PartialRoomTypeValidatorType,
  RoomTypeImportRow,
};
