import { PaymentMode } from "@/generated/prisma/enums";
import z from "zod";

const saleReturnItemValidator = z.object({
  saleItemId: z.coerce.number().min(1),
  inventoryItemId: z.coerce.number().min(1),
  quantity: z.coerce.number().int().min(0).default(0),
  isLooseQuantity: z.coerce.boolean().default(false),
});

const saleReturnValidator = z
  .object({
    drugBillId: z.coerce.number().min(1),
    createdAt: z.coerce.date().default(new Date()),
    refundMode: z.enum(PaymentMode).default(PaymentMode.CASH),
    remarks: z.string().max(500).nullable().optional(),
    items: z.array(saleReturnItemValidator).min(1),
  })
  .superRefine((data, ctx) => {
    const selectedItems = data.items.filter((item) => Number(item.quantity || 0) > 0);
    if (!selectedItems.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter return quantity for at least one item",
        path: ["items"],
      });
    }
  });

type saleReturnValidatorType = z.input<typeof saleReturnValidator>;
type saleReturnItemValidatorType = z.input<typeof saleReturnItemValidator>;

export { saleReturnValidator, saleReturnItemValidator };
export type { saleReturnValidatorType, saleReturnItemValidatorType };
