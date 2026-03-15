import SummaryRow from "./SummaryRow";
import { amount } from "@/lib/utils";
import { sectionsWithTotals } from "@/lib/type";

const InvoicePaymentSummary = ({
  sectionsWithTotals,
  discount,
  paid,
}: {
  sectionsWithTotals: sectionsWithTotals;
  discount: number;
  paid: number;
}) => {
  const grossTotal = sectionsWithTotals.reduce(
    (sum, section) => sum + section.total,
    0,
  );
  const finalTotal = Math.max(grossTotal - discount, 0);

  const due = Math.max(finalTotal - paid, 0);

  return (
    <div className="mt-4 ml-auto w-full max-w-130 overflow-hidden">
      <table className="w-full">
        <tbody>
          <SummaryRow
            leftLabel="Total Amount"
            leftValue={amount(grossTotal)}
            rightLabel="Final Total"
            rightValue={amount(finalTotal)}
          />
          <SummaryRow
            leftLabel="Discount"
            leftValue={amount(discount)}
            rightLabel="Amount Paid"
            rightValue={amount(paid)}
          />
          <SummaryRow
            leftLabel="Rounded Off"
            leftValue={amount(0)}
            rightLabel="Amount Due"
            rightValue={amount(due)}
            isLast
          />
        </tbody>
      </table>
    </div>
  );
};

export default InvoicePaymentSummary;
