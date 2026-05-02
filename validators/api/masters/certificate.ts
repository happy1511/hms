import { CertificateType } from "@/generated/prisma/enums";
import z from "zod";

export const certificateTemplateValidator = z.object({
  type: z.enum(CertificateType),
  content: z.string().trim().min(1, "Certificate content is required"),
});

export const opdCertificateValidator = z.object({
  opdId: z.coerce.number().int().positive(),
  type: z.enum(CertificateType),
  content: z.string().trim().min(1, "Certificate content is required"),
});

export type CertificateTemplateValidatorType = z.input<
  typeof certificateTemplateValidator
>;
export type OpdCertificateValidatorType = z.input<typeof opdCertificateValidator>;
