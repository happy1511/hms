"use client";

type Item = {
  description: string;
  qty: number;
  price: number;
  discount: number;
  date?: string;
};

type BillingItem = {
  name: string;
  items: Item[];
};

type Transaction = {
  date: string;
  mode: string;
  amount: number;
  remarks?: string;
  receivedBy?: string;
};

interface Props {
  customer: {
    name: string;
    uhid?: string;
    gender?: string;
    age?: string;
    relation?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  invoice: {
    number: string;
    date: string;
    opdNumber?: string;
    consultant?: string;
    referredBy?: string;
    status?: string;
  };
  billingItems: BillingItem[];
  discount: number;
  paid: number;
  includePaymentHistory?: boolean;
  includeRemarks?: boolean;
  transactions?: Transaction[];
}

const amount = (value: number) => value.toFixed(2);
const lineGross = (item: Item) => item.qty * item.price;
const lineNet = (item: Item) =>
  Math.max(lineGross(item) - (item.discount || 0), 0);

const InvoicePrintLayout = ({
  customer,
  invoice,
  billingItems,
  discount,
  paid,
  includePaymentHistory = false,
  includeRemarks = false,
  transactions = [],
}: Props) => {
  const sectionsWithTotals = billingItems.map((section) => ({
    ...section,
    total: section.items.reduce((sum, item) => sum + lineNet(item), 0),
  }));
  const grossTotal = sectionsWithTotals.reduce(
    (sum, section) => sum + section.total,
    0,
  );
  const finalTotal = Math.max(grossTotal - discount, 0);
  const due = Math.max(finalTotal - paid, 0);

  return (
    <div className="invoice-print-wrap bg-[#efefef] p-4 text-[11px] text-black">
      <div className="mx-auto w-full max-w-[1100px] border-[3px] border-sky-500 bg-[#efefef] p-6 print:max-w-none print:border-0 print:p-0">
        <div className="mb-3">
          <p className="text-sm font-medium">Invoice</p>
          <div className="mt-2 flex flex-wrap gap-1 text-[10px] font-semibold text-white">
            <span className="bg-zinc-600 px-2 py-0.5">{customer.name || "-"}</span>
            <span className="bg-sky-600 px-2 py-0.5">
              Invoice no: {invoice.number}
            </span>
            <span className="bg-red-500 px-2 py-0.5">
              Invoice date: {invoice.date}
            </span>
            <span className="bg-sky-600 px-2 py-0.5">
              Status: {invoice.status || (due > 0 ? "Unpaid" : "Paid")}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <InfoRow
            leftLabel="UHID"
            leftValue={customer.uhid || "-"}
            rightLabel="Date"
            rightValue={invoice.date}
          />
          <InfoRow
            leftLabel="Patient"
            leftValue={customer.name || "-"}
            rightLabel="OPD Number"
            rightValue={invoice.opdNumber || "-"}
          />
          <InfoRow
            leftLabel="Gender / Age"
            leftValue={`${customer.gender || "-"}${customer.age ? ` / ${customer.age}` : ""}`}
            rightLabel="Invoice No."
            rightValue={invoice.number}
          />
          <InfoRow
            leftLabel="Address"
            leftValue={customer.address || "-"}
            rightLabel="Consultant"
            rightValue={invoice.consultant || "-"}
          />
          <InfoRow
            leftLabel="Relation"
            leftValue={customer.relation || "-"}
            rightLabel="Referred By"
            rightValue={invoice.referredBy || "-"}
          />
          <InfoRow
            leftLabel="Mobile No."
            leftValue={customer.phone || "-"}
            rightLabel=""
            rightValue=""
          />
        </div>

        <div className="mt-4 space-y-3">
          {sectionsWithTotals.map((section) => (
            <div key={section.name} className="overflow-hidden border border-black">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#dedede]">
                    <Cell as="th" className="w-[44px] text-left">No.</Cell>
                    <Cell as="th" className="w-[120px] text-left">Date</Cell>
                    <Cell as="th" className="text-left">
                      {section.name.toUpperCase()}
                    </Cell>
                    <Cell as="th" className="w-[60px] text-right">Qty</Cell>
                    <Cell as="th" className="w-[120px] text-right">Rate</Cell>
                    <Cell as="th" className="w-[150px] text-right">Discount</Cell>
                    <Cell as="th" className="w-[180px] text-right">Total</Cell>
                  </tr>
                </thead>
                <tbody>
                  {section.items.map((item, index) => (
                    <tr key={`${section.name}-${index}`}>
                      <Cell className="text-left">{index + 1}.</Cell>
                      <Cell className="text-left">{item.date || invoice.date}</Cell>
                      <Cell className="text-left">{item.description}</Cell>
                      <Cell className="text-right">{item.qty}</Cell>
                      <Cell className="text-right">{amount(item.price)}</Cell>
                      <Cell className="text-right">
                        {item.discount ? amount(item.discount) : ""}
                      </Cell>
                      <Cell className="text-right">{amount(lineNet(item))}</Cell>
                    </tr>
                  ))}
                  <tr>
                    <Cell colSpan={6} className="text-right font-semibold">
                      Sub Total
                    </Cell>
                    <Cell className="text-right font-semibold">
                      {amount(section.total)}
                    </Cell>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}

          {includePaymentHistory && (
            <div className="overflow-hidden border border-black">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#dedede]">
                    <Cell as="th" className="w-[170px] text-left">Date</Cell>
                    <Cell as="th" className="w-[130px] text-left">Mode</Cell>
                    {includeRemarks && (
                      <Cell as="th" className="text-left">Remarks</Cell>
                    )}
                    <Cell as="th" className="w-[180px] text-left">Received By</Cell>
                    <Cell as="th" className="w-[130px] text-right">Amount</Cell>
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
                        <Cell className="text-right">
                          {amount(transaction.amount)}
                        </Cell>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <Cell
                        colSpan={includeRemarks ? 5 : 4}
                        className="text-center"
                      >
                        No payment transactions found
                      </Cell>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-4 ml-auto w-full max-w-[520px] overflow-hidden border border-black">
          <table className="w-full border-collapse">
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
      </div>
    </div>
  );
};

const InfoRow = ({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
}: {
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
}) => (
  <table className="w-full border-collapse">
    <tbody>
      <tr>
        <Cell className="w-[21%] bg-[#dedede] font-semibold text-left">
          {leftLabel ? `${leftLabel}:` : ""}
        </Cell>
        <Cell className="w-[29%] text-left">{leftValue}</Cell>
        <Cell className="w-[21%] bg-[#dedede] font-semibold text-left">
          {rightLabel ? `${rightLabel}:` : ""}
        </Cell>
        <Cell className="w-[29%] text-left">{rightValue}</Cell>
      </tr>
    </tbody>
  </table>
);

const SummaryRow = ({
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
  isLast = false,
}: {
  leftLabel: string;
  leftValue: string;
  rightLabel: string;
  rightValue: string;
  isLast?: boolean;
}) => (
  <tr className={isLast ? "" : "border-b border-black"}>
    <Cell className="w-[31%] bg-[#dedede] font-semibold text-left">
      {leftLabel}
    </Cell>
    <Cell className="w-[19%] text-right">{leftValue}</Cell>
    <Cell className="w-[31%] bg-[#dedede] font-semibold text-left">
      {rightLabel}
    </Cell>
    <Cell className="w-[19%] text-right">{rightValue}</Cell>
  </tr>
);

const Cell = ({
  children,
  className = "",
  as = "td",
  colSpan,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "td" | "th";
  colSpan?: number;
}) => {
  const Component = as;

  return (
    <Component
      colSpan={colSpan}
      className={`border border-black px-1.5 py-1 align-middle font-normal ${className}`}
    >
      {children}
    </Component>
  );
};

export default InvoicePrintLayout;
