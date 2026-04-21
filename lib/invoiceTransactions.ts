import { TransactionType } from "@/generated/prisma/enums";

type TransactionLike = {
  amount?: number | string | null | undefined | unknown;
  transactionType?: TransactionType | string | null;
};

const roundAmount = (value: number) => Number(value.toFixed(2));

export const getSignedTransactionAmount = ({
  amount,
  transactionType,
}: TransactionLike) => {
  const resolvedAmount = Number(amount || 0);
  const multiplier =
    transactionType === TransactionType.REFUND ? -1 : 1;

  return roundAmount(resolvedAmount * multiplier);
};

export const getNetInvoicePaidAmount = (
  transactions: TransactionLike[] = [],
) =>
  roundAmount(
    transactions.reduce(
      (sum, transaction) => sum + getSignedTransactionAmount(transaction),
      0,
    ),
  );

export const getInvoiceDueAmount = ({
  total,
  transactions = [],
}: {
  total: number;
  transactions?: TransactionLike[];
}) =>
  roundAmount(
    Number(total || 0) - getNetInvoicePaidAmount(transactions),
  );
