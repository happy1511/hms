import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { PlusIcon } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "../ui/form";
import CustomButton from "../common/CustomButton";
import FormField from "../form-inputs/FormField";
import { PaymentMode } from "@/generated/prisma/enums";
import {
  addInvoiceTransactionValidator,
  addInvoiceTransactionValidatorType,
} from "@/validators/api/invoice/invoice";
import { useCreateInvoiceTransaction } from "@/hooks/query/invoice";

interface Props {
  billId: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

const AddPaymentModal = ({ billId, open, onOpenChange, trigger }: Props) => {
  const { mutateAsync, isPending } = useCreateInvoiceTransaction();

  const transactionForm = useForm<addInvoiceTransactionValidatorType>({
    defaultValues: {
      id: billId,
    },
    resolver: zodResolver(addInvoiceTransactionValidator),
  });

  const onSubmit = async (values: addInvoiceTransactionValidatorType) => {
    await mutateAsync(values);
    transactionForm.reset({
      id: billId,
      amount: 0,
      mode: PaymentMode.CASH,
      remarks: "",
    });
    onOpenChange?.(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            className="h-auto shadow-none p-1 cursor-pointer"
          >
            <PlusIcon className="size-2.5 text-destructive" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-3xl! border-secondary border-4 bg-white">
        <DialogHeader>
          <DialogTitle className="text-black/60 text-sm">
            Add Payment Transaction
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[70dvh] overflow-y-auto text-tiny">
          <Form {...transactionForm}>
            <form onSubmit={transactionForm.handleSubmit(onSubmit)}>
              <FormField
                control={transactionForm.control}
                label="Amount"
                name="amount"
                type="number"
                required
              />
              <FormField
                control={transactionForm.control}
                label="Mode"
                name="mode"
                options={Object.values(PaymentMode).map((p) => ({
                  value: p,
                  label: p,
                }))}
                type="select"
                required
              />
              <FormField
                control={transactionForm.control}
                label="Remarks"
                name="remarks"
                type="textarea"
              />
              <div className="col-span-2 space-x-2">
                <div className="w-full flex justify-end">
                  <CustomButton
                    disabled={isPending}
                    type="submit"
                    className="self-end"
                  >
                    Save
                  </CustomButton>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPaymentModal;
