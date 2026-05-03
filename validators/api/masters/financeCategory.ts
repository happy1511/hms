import { FinanceCategoryType } from "@/generated/prisma/enums";
import { z } from "zod";

const financeCategoryImportRowValidator = z.object({
  name: z.string().trim().min(1, "name is required"),
  type: z.enum(FinanceCategoryType),
  description: z.string().optional().default(""),
});

type FinanceCategoryImportRow = z.infer<typeof financeCategoryImportRowValidator>;

export { financeCategoryImportRowValidator };
export type { FinanceCategoryImportRow };
