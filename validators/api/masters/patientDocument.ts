import { DocumentType } from "@/generated/prisma/enums";
import z from "zod";

export const patientDocumentUploadValidator = z
  .object({
    documentName: z
      .string()
      .trim()
      .min(1, "Document name is required")
      .refine((value) => Object.values(DocumentType).includes(value as DocumentType), {
        message: "Select a valid document name",
      }),
    opdId: z.coerce.number().int().positive().optional(),
    ipdId: z.coerce.number().int().positive().optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.opdId && !value.ipdId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["opdId"],
        message: "Select either an OPD or IPD record",
      });
    }

    if (value.opdId && value.ipdId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ipdId"],
        message: "Only one linked record is allowed",
      });
    }
  });

export type PatientDocumentUploadValidatorType = z.input<
  typeof patientDocumentUploadValidator
>;
