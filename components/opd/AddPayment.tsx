import React from "react";
import TransactionsModal from "../common/TransactionsModal";
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
import {
  ModuleType,
  PaymentMode,
  TransactionType,
} from "@/generated/prisma/enums";
import { getSignedTransactionAmount } from "@/lib/invoiceTransactions";
import {
  addInvoiceTransactionValidator,
  addInvoiceTransactionValidatorType,
} from "@/validators/api/invoice/invoice";
import {
  useCreateInvoiceTransaction,
  useInvoiceDetails,
} from "@/hooks/query/invoice";
import { useState } from "react";

interface Props {
  billId: number;
  dueAmount?: number;
  paidAmount?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

const AddPaymentModal = ({
  billId,
  dueAmount = 0,
  paidAmount = 0,
  open,
  onOpenChange,
  trigger,
}: Props) => {
  const [transactionsOpen, setTransactionsOpen] = useState(false);
  const { mutateAsync, isPending } = useCreateInvoiceTransaction();
  const { data: invoiceDetails, refetch: refetchInvoiceDetails } =
    useInvoiceDetails({
      invoiceId: billId,
    });

  const transactionForm = useForm<addInvoiceTransactionValidatorType>({
    defaultValues: {
      id: billId,
      mode: PaymentMode.CASH,
      transactionType: TransactionType.PAYMENT,
    },
    resolver: zodResolver(addInvoiceTransactionValidator),
  });

  const transactionType = transactionForm.watch("transactionType");
  const amount = Number(transactionForm.watch("amount") || 0);
  const projectedDue = Math.max(
    Number(dueAmount || 0) -
      getSignedTransactionAmount({
        amount,
        transactionType,
      }),
    0,
  );

  const onSubmit = async (values: addInvoiceTransactionValidatorType) => {
    await mutateAsync(values);
    await refetchInvoiceDetails();
    transactionForm.reset({
      id: billId,
      amount: 0,
      mode: PaymentMode.CASH,
      transactionType: TransactionType.PAYMENT,
      remarks: "",
    });
    onOpenChange?.(false);
    setTransactionsOpen(true);
  };

  const patientName = [
    invoiceDetails?.opd?.patient?.firstName ?? invoiceDetails?.ipd?.patient?.firstName,
    invoiceDetails?.opd?.patient?.lastName ?? invoiceDetails?.ipd?.patient?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const printModule = invoiceDetails?.opd
    ? ModuleType.OPD_BILL
    : invoiceDetails?.ipd
      ? ModuleType.IPD_BILL
      : undefined;

  return (
    <>
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
              Add Invoice Transaction
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[70dvh] overflow-y-auto text-tiny">
            <Form {...transactionForm}>
              <form onSubmit={transactionForm.handleSubmit(onSubmit)}>
                <div className="mb-5 rounded-md border border-secondary/20 bg-secondary/5 px-3 py-2 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-black/60">Due</span>
                    <span className="font-semibold">
                      Rs. {Number(projectedDue || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
                <FormField
                  control={transactionForm.control}
                  label="Transaction Type"
                  name="transactionType"
                  options={Object.values(TransactionType).map((type) => ({
                    value: type,
                    label: type,
                  }))}
                  type="select"
                  required
                />
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

      <TransactionsModal
        billId={billId}
        open={transactionsOpen}
        onOpenChange={setTransactionsOpen}
        patientName={patientName || "Invoice"}
        data={invoiceDetails?.transactions || []}
        printModule={printModule}
        trigger={<div />}
      />
    </>
  );
};

export default AddPaymentModal;
