import {
  Document,
  Page,
  PDFViewer,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

interface Item {
  description: string;
  qty: number;
  price: number;
  discount: number;
  date?: string;
}

interface BillingItem {
  name: string;
  items: Item[];
}

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
  };
  billingItems: BillingItem[];
  discount: number;
  paid: number;
  showViewer?: boolean;
  includePaymentHistory?: boolean;
  includeRemarks?: boolean;
  transactions?: {
    date: string;
    mode: string;
    amount: number;
    remarks?: string;
    receivedBy?: string;
  }[];
}

const amount = (value: number) => `Rs. ${value.toFixed(2)}`;
const lineGross = (item: Item) => item.qty * item.price;
const lineNet = (item: Item) =>
  Math.max(lineGross(item) - (item.discount || 0), 0);

const InvoiceDocument = (data: Props) => {
  const sectionsWithTotals = data.billingItems.map((section) => ({
    ...section,
    total: section.items.reduce((sum, item) => sum + lineNet(item), 0),
  }));

  const grossTotal = sectionsWithTotals.reduce(
    (sum, section) => sum + section.total,
    0,
  );
  const finalTotal = Math.max(grossTotal - data.discount, 0);
  const due = Math.max(finalTotal - data.paid, 0);
  const transactions = data.transactions ?? [];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.frame}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>INVOICE</Text>
          </View>

          <View style={styles.infoTable}>
            <InfoRow
              label1="UHID"
              value1={data.customer.uhid || "-"}
              label2="Date"
              value2={data.invoice.date}
            />
            <InfoRow
              label1="Patient"
              value1={data.customer.name || "-"}
              label2="OPD Number"
              value2={data.invoice.opdNumber || "-"}
            />
            <InfoRow
              label1="Gender / Age"
              value1={`${data.customer.gender || "-"}${data.customer.age ? `, ${data.customer.age} years` : ""}`}
              label2="Invoice No."
              value2={data.invoice.number}
            />
            <InfoRow
              label1="Address"
              value1={data.customer.address || "-"}
              label2="Consultant"
              value2={data.invoice.consultant || "-"}
            />
            <InfoRow
              label1="Relation"
              value1={data.customer.relation || "-"}
              label2="Referred By"
              value2={data.invoice.referredBy || "-"}
            />
            <InfoRow
              label1="Mobile No."
              value1={data.customer.phone || "-"}
              label2=""
              value2=""
            />
          </View>

          {sectionsWithTotals.map((section) => (
            <View key={section.name} style={styles.sectionBlock}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.cellNo}>No.</Text>
                <Text style={styles.cellDate}>Date</Text>
                <Text style={styles.cellDesc}>
                  {section.name.toUpperCase()}
                </Text>
                <Text style={styles.cellQty}>Qty</Text>
                <Text style={styles.cellRate}>Rate</Text>
                <Text style={styles.cellDiscount}>Discount</Text>
                <Text style={styles.cellTotal}>Total</Text>
              </View>

              {section.items.map((item, index) => (
                <View key={`${section.name}-${index}`} style={styles.itemRow}>
                  <Text style={styles.cellNo}>{index + 1}.</Text>
                  <Text style={styles.cellDate}>
                    {item.date || data.invoice.date}
                  </Text>
                  <Text style={styles.cellDesc}>{item.description}</Text>
                  <Text style={styles.cellQty}>{item.qty}</Text>
                  <Text style={styles.cellRate}>{item.price.toFixed(2)}</Text>
                  <Text style={styles.cellDiscount}>
                    {item.discount ? item.discount.toFixed(2) : "-"}
                  </Text>
                  <Text style={styles.cellTotal}>
                    {lineNet(item).toFixed(2)}
                  </Text>
                </View>
              ))}

              <View style={styles.subTotalRow}>
                <Text style={styles.subTotalLabel}>Sub Total</Text>
                <Text style={styles.subTotalValue}>
                  {section.total.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}

          {data.includePaymentHistory && (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.txnDate}>Date</Text>
                <Text style={styles.txnMode}>Mode</Text>
                {data.includeRemarks && (
                  <Text style={styles.txnRemarks}>Remarks</Text>
                )}
                <Text style={styles.txnBy}>Received By</Text>
                <Text style={styles.txnAmount}>Amount</Text>
              </View>

              {transactions.length > 0 ? (
                transactions.map((txn, index) => (
                  <View key={`txn-${index}`} style={styles.itemRow}>
                    <Text style={styles.txnDate}>{txn.date}</Text>
                    <Text style={styles.txnMode}>{txn.mode}</Text>
                    {data.includeRemarks && (
                      <Text style={styles.txnRemarks}>{txn.remarks || "-"}</Text>
                    )}
                    <Text style={styles.txnBy}>{txn.receivedBy || "-"}</Text>
                    <Text style={styles.txnAmount}>{txn.amount.toFixed(2)}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.itemRow}>
                  <Text style={styles.txnEmpty}>No payment transactions found</Text>
                </View>
              )}
            </View>
          )}

          <View style={styles.summaryTable}>
            <SummaryRow
              leftLabel="Total Amount"
              leftValue={amount(grossTotal)}
              rightLabel="Final Total"
              rightValue={amount(finalTotal)}
            />
            <SummaryRow
              leftLabel="Discount"
              leftValue={amount(data.discount)}
              rightLabel="Amount Paid"
              rightValue={amount(data.paid)}
            />
            <SummaryRow
              leftLabel="Rounded Off"
              leftValue={amount(0)}
              rightLabel="Amount Due"
              rightValue={amount(due)}
            />
          </View>
        </View>
      </Page>
    </Document>
  );
};

const InvoiceExport = (props: Props) => {
  if (props.showViewer === false) {
    return <InvoiceDocument {...props} />;
  }

  return (
    <PDFViewer className="w-full h-full">
      <InvoiceDocument {...props} />
    </PDFViewer>
  );
};

const InfoRow = ({
  label1,
  value1,
  label2,
  value2,
}: {
  label1: string;
  value1: string;
  label2: string;
  value2: string;
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label1 ? `${label1}:` : ""}</Text>
    <Text style={styles.infoValue}>{value1}</Text>
    <Text style={styles.infoLabel}>{label2 ? `${label2}:` : ""}</Text>
    <Text style={styles.infoValue}>{value2}</Text>
  </View>
);

const SummaryRow = ({
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
  <View style={styles.summaryRow}>
    <Text style={styles.summaryLabel}>{leftLabel}:</Text>
    <Text style={styles.summaryValue}>{leftValue}</Text>
    <Text style={styles.summaryLabel}>{rightLabel}:</Text>
    <Text style={styles.summaryValue}>{rightValue}</Text>
  </View>
);

const styles = StyleSheet.create({
  page: { backgroundColor: "#ffffff", fontFamily: "Helvetica", fontSize: 9 },
  frame: { margin: 14, padding: 8 },
  titleRow: {
    borderWidth: 1,
    borderColor: "#111",
    alignItems: "center",
    paddingVertical: 2,
    marginBottom: 4,
  },
  title: { fontFamily: "Helvetica-Bold", fontSize: 10 },
  infoTable: { borderWidth: 1, borderColor: "#111", marginBottom: 8 },
  infoRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#111",
    minHeight: 10,
    alignItems: "stretch",
  },
  infoLabel: {
    width: "17%",
    borderRightWidth: 1,
    borderColor: "#111",
    paddingHorizontal: 4,
    fontFamily: "Helvetica-Bold",
    display: "flex",
    alignItems: "center",
    paddingVertical: 3,
  },
  infoValue: {
    width: "33%",
    borderRightWidth: 1,
    borderColor: "#111",
    display: "flex",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  sectionBlock: { marginBottom: 6, borderWidth: 1, borderColor: "#111" },
  sectionTitleRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#111",
    backgroundColor: "#f2f2f2",
    minHeight: 20,
    alignItems: "stretch",
  },
  itemRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#111",
    minHeight: 20,
    alignItems: "stretch",
  },
  cellNo: {
    width: "4%",
    borderRightWidth: 1,
    borderColor: "#111",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  cellDate: {
    width: "12%",
    borderRightWidth: 1,
    borderColor: "#111",
    display: "flex",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  cellDesc: {
    width: "36%",
    borderRightWidth: 1,
    borderColor: "#111",
    display: "flex",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  cellQty: {
    width: "6%",
    borderRightWidth: 1,
    borderColor: "#111",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  cellRate: {
    width: "11%",
    borderRightWidth: 1,
    borderColor: "#111",
    textAlign: "right",
    display: "flex",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  cellDiscount: {
    width: "14%",
    borderRightWidth: 1,
    borderColor: "#111",
    textAlign: "right",
    display: "flex",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  cellTotal: {
    width: "17%",
    textAlign: "right",
    display: "flex",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  subTotalRow: { flexDirection: "row", alignItems: "stretch" },
  subTotalLabel: {
    width: "83%",
    borderRightWidth: 1,
    borderColor: "#111",
    textAlign: "right",
    display: "flex",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 4,
    fontFamily: "Helvetica-Bold",
  },
  subTotalValue: {
    width: "17%",
    textAlign: "right",
    display: "flex",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 4,
    fontFamily: "Helvetica-Bold",
  },
  summaryTable: {
    marginTop: 6,
    marginLeft: "30%",
    borderWidth: 1,
    borderColor: "#111",
  },
  summaryRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#111",
    alignItems: "stretch",
  },
  summaryLabel: {
    width: "31%",
    borderRightWidth: 1,
    borderColor: "#111",
    display: "flex",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 4,
    fontFamily: "Helvetica-Bold",
  },
  summaryValue: {
    width: "19%",
    borderRightWidth: 1,
    borderColor: "#111",
    display: "flex",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 4,
    textAlign: "right",
  },
  txnDate: {
    width: "20%",
    borderRightWidth: 1,
    borderColor: "#111",
    paddingHorizontal: 4,
    display: "flex",
    alignItems: "center",
    paddingVertical: 3,
  },
  txnMode: {
    width: "16%",
    borderRightWidth: 1,
    borderColor: "#111",
    paddingHorizontal: 4,
    display: "flex",
    alignItems: "center",
    paddingVertical: 3,
  },
  txnRemarks: {
    width: "34%",
    borderRightWidth: 1,
    borderColor: "#111",
    paddingHorizontal: 4,
    display: "flex",
    alignItems: "center",
    paddingVertical: 3,
  },
  txnBy: {
    width: "18%",
    borderRightWidth: 1,
    borderColor: "#111",
    paddingHorizontal: 4,
    display: "flex",
    alignItems: "center",
    paddingVertical: 3,
  },
  txnAmount: {
    width: "12%",
    textAlign: "right",
    paddingHorizontal: 4,
    display: "flex",
    alignItems: "center",
    paddingVertical: 3,
  },
  txnEmpty: {
    width: "100%",
    paddingHorizontal: 4,
    display: "flex",
    alignItems: "center",
    paddingVertical: 3,
    textAlign: "center",
  },
});

export default InvoiceExport;
