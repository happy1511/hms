import { Transaction } from "@/lib/type";
import Cell from "./Cell";
import { amount } from "@/lib/utils";

const InvoicePaymentHistory = ({
  includeRemarks,
  transactions,
}: {
  includeRemarks: boolean;
  transactions: Transaction[];
}) => {
  return (
    <div className="overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#dedede]">
            <Cell as="th" className="w-42.5 text-left">
              Date
            </Cell>
            <Cell as="th" className="w-32.5 text-left">
              Mode
            </Cell>
            {includeRemarks && (
              <Cell as="th" className="text-left">
                Remarks
              </Cell>
            )}
            <Cell as="th" className="w-45 text-left">
              Received By
            </Cell>
            <Cell as="th" className="w-32.5 text-right">
              Amount
            </Cell>
          </tr>
        </thead>
        <tbody>
          {transactions.length ? (
            transactions.map((transaction, index) => (
              <tr key={`${transaction.date}-${transaction.mode}-${index}`}>
                <Cell className="text-left">{transaction.date}</Cell>
                <Cell className="text-left">{transaction.mode}</Cell>
                {includeRemarks && (
                  <Cell className="text-left">
                    {transaction.remarks || "-"}
                  </Cell>
                )}
                <Cell className="text-left">
                  {transaction.receivedBy || "-"}
                </Cell>
                <Cell className="text-right">{amount(transaction.amount)}</Cell>
              </tr>
            ))
          ) : (
            <tr>
              <Cell colSpan={includeRemarks ? 5 : 4} className="text-center">
                No payment transactions found
              </Cell>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InvoicePaymentHistory;
