import {
  Document,
  Page,
  PDFViewer,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

interface SaleInvoiceLine {
  name: string;
  batchNo: number;
  qty: number;
  rate: number;
  taxableAmount: number;
  gstAmount: number;
  cGstAmount: number;
  sGstAmount: number;
  iGstAmount: number;
  total: number;
}

interface SaleInvoiceExportProps {
  billNo: string;
  billDate: string;
  patientName: string;
  doctorName?: string;
  lines: SaleInvoiceLine[];
  invoiceDiscount: number;
  invoiceTotal: number;
  showViewer?: boolean;
  includePaymentHistory?: boolean;
  includeRemarks?: boolean;
  transactions?: {
    date: string;
    mode: string;
    remarks?: string;
    receivedBy?: string;
    amount: number;
  }[];
}

/* -------------------- DOCUMENT -------------------- */

const SaleInvoiceDocument = ({
  billNo,
  billDate,
  patientName,
  doctorName,
  lines,
  invoiceDiscount,
  invoiceTotal,
  includePaymentHistory = false,
  includeRemarks = false,
  transactions = [],
}: SaleInvoiceExportProps) => {
  const taxableSubTotal = lines.reduce((sum, l) => sum + l.taxableAmount, 0);
  const gstTotal = lines.reduce((sum, l) => sum + l.gstAmount, 0);
  const cGstTotal = lines.reduce((sum, l) => sum + l.cGstAmount, 0);
  const sGstTotal = lines.reduce((sum, l) => sum + l.sGstAmount, 0);
  const iGstTotal = lines.reduce((sum, l) => sum + l.iGstAmount, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.frame}>
          {/* TITLE */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>PHARMACY SALE INVOICE</Text>
          </View>

          {/* INFO TABLE */}
          <View style={styles.infoTable}>
            <InfoRow
              label1="Bill No"
              value1={billNo}
              label2="Date"
              value2={billDate}
            />
            <InfoRow
              label1="Patient"
              value1={patientName}
              label2="Doctor"
              value2={doctorName || "-"}
            />
          </View>

          {/* ITEMS TABLE */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.cellDrug}>Drug</Text>
              <Text style={styles.cellSmall}>Batch</Text>
              <Text style={styles.cellSmall}>Qty</Text>
              <Text style={styles.cellSmall}>Rate</Text>
              <Text style={styles.cellTiny}>Taxable</Text>
              <Text style={styles.cellTiny}>CGST</Text>
              <Text style={styles.cellTiny}>SGST</Text>
              <Text style={styles.cellTiny}>IGST</Text>
              <Text style={styles.cellTiny}>GST</Text>
              <Text style={styles.cellTiny}>Total</Text>
            </View>

            {lines.map((line, index) => (
              <View key={index} style={styles.itemRow}>
                <Text style={styles.cellDrug}>{line.name}</Text>
                <Text style={styles.cellSmall}>{line.batchNo}</Text>
                <Text style={styles.cellSmall}>{line.qty}</Text>
                <Text style={styles.cellSmall}>{line.rate.toFixed(2)}</Text>
                <Text style={styles.cellTiny}>
                  {line.taxableAmount.toFixed(2)}
                </Text>
                <Text style={styles.cellTiny}>
                  {line.cGstAmount.toFixed(2)}
                </Text>
                <Text style={styles.cellTiny}>
                  {line.sGstAmount.toFixed(2)}
                </Text>
                <Text style={styles.cellTiny}>
                  {line.iGstAmount.toFixed(2)}
                </Text>
                <Text style={styles.cellTiny}>{line.gstAmount.toFixed(2)}</Text>
                <Text style={styles.cellTiny}>{line.total.toFixed(2)}</Text>
              </View>
            ))}

            {/* SUBTOTAL */}
            <View style={styles.subTotalRow}>
              <Text style={styles.subTotalLabel}>Taxable Subtotal</Text>
              <Text style={styles.subTotalValue}>
                {taxableSubTotal.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* PAYMENT HISTORY */}
          {includePaymentHistory && (
            <View style={styles.sectionBlock}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.txnDate}>Date</Text>
                <Text style={styles.txnMode}>Mode</Text>
                {includeRemarks && (
                  <Text style={styles.txnRemarks}>Remarks</Text>
                )}
                <Text style={styles.txnBy}>Received By</Text>
                <Text style={styles.txnAmount}>Amount</Text>
              </View>

              {transactions.length > 0 ? (
                transactions.map((txn, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={styles.txnDate}>{txn.date}</Text>
                    <Text style={styles.txnMode}>{txn.mode}</Text>
                    {includeRemarks && (
                      <Text style={styles.txnRemarks}>
                        {txn.remarks || "-"}
                      </Text>
                    )}
                    <Text style={styles.txnBy}>{txn.receivedBy || "-"}</Text>
                    <Text style={styles.txnAmount}>
                      {txn.amount.toFixed(2)}
                    </Text>
                  </View>
                ))
              ) : (
                <View style={styles.itemRow}>
                  <Text style={styles.txnEmpty}>
                    No payment transactions found
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* SUMMARY TABLE */}
          <View style={styles.summaryTable}>
            <SummaryRow
              leftLabel="GST Total"
              leftValue={gstTotal.toFixed(2)}
              rightLabel="Invoice Discount"
              rightValue={invoiceDiscount.toFixed(2)}
            />
            <SummaryRow
              leftLabel="CGST Total"
              leftValue={cGstTotal.toFixed(2)}
              rightLabel="SGST Total"
              rightValue={sGstTotal.toFixed(2)}
            />
            <SummaryRow
              leftLabel="IGST Total"
              leftValue={iGstTotal.toFixed(2)}
              rightLabel="Grand Total"
              rightValue={invoiceTotal.toFixed(2)}
            />
          </View>
        </View>
      </Page>
    </Document>
  );
};

/* -------------------- EXPORT WRAPPER -------------------- */

const SaleInvoiceExport = (props: SaleInvoiceExportProps) => {
  if (props.showViewer === false) {
    return <SaleInvoiceDocument {...props} />;
  }

  return (
    <PDFViewer className="w-full h-full">
      <SaleInvoiceDocument {...props} />
    </PDFViewer>
  );
};

/* -------------------- REUSABLE ROWS -------------------- */

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
    <Text style={styles.infoLabel}>{label1}:</Text>
    <Text style={styles.infoValue}>{value1}</Text>
    <Text style={styles.infoLabel}>{label2}:</Text>
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

/* -------------------- STYLES -------------------- */

const styles = StyleSheet.create({
  page: { backgroundColor: "#ffffff", fontFamily: "Helvetica", fontSize: 9 },
  frame: { margin: 14, padding: 8 },

  titleRow: {
    borderWidth: 1,
    borderColor: "#111",
    alignItems: "center",
    paddingVertical: 4,
    marginBottom: 6,
  },
  title: { fontFamily: "Helvetica-Bold", fontSize: 11 },

  infoTable: { borderWidth: 1, borderColor: "#111", marginBottom: 8 },

  infoRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#111",
  },
  infoLabel: {
    width: "17%",
    borderRightWidth: 1,
    borderColor: "#111",
    padding: 4,
    fontFamily: "Helvetica-Bold",
  },
  infoValue: {
    width: "33%",
    borderRightWidth: 1,
    borderColor: "#111",
    padding: 4,
  },

  sectionBlock: { marginBottom: 6, borderWidth: 1, borderColor: "#111" },

  sectionTitleRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#111",
    backgroundColor: "#f2f2f2",
  },

  itemRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#111",
  },

  cellDrug: {
    width: "20%",
    borderRightWidth: 1,
    borderColor: "#111",
    padding: 3,
  },
  cellSmall: {
    width: "8%",
    borderRightWidth: 1,
    borderColor: "#111",
    padding: 3,
    textAlign: "right",
  },
  cellTiny: {
    width: "9%",
    borderRightWidth: 1,
    borderColor: "#111",
    padding: 3,
    textAlign: "right",
  },

  subTotalRow: { flexDirection: "row" },
  subTotalLabel: {
    width: "91%",
    borderRightWidth: 1,
    borderColor: "#111",
    textAlign: "right",
    padding: 4,
    fontFamily: "Helvetica-Bold",
  },
  subTotalValue: {
    width: "9%",
    textAlign: "right",
    padding: 4,
    fontFamily: "Helvetica-Bold",
  },

  summaryTable: {
    marginTop: 6,
    marginLeft: "40%",
    borderWidth: 1,
    borderColor: "#111",
  },

  summaryRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#111",
  },
  summaryLabel: {
    width: "31%",
    borderRightWidth: 1,
    borderColor: "#111",
    padding: 4,
    fontFamily: "Helvetica-Bold",
  },
  summaryValue: {
    width: "19%",
    borderRightWidth: 1,
    borderColor: "#111",
    padding: 4,
    textAlign: "right",
  },

  txnDate: {
    width: "22%",
    borderRightWidth: 1,
    borderColor: "#111",
    padding: 3,
  },
  txnMode: {
    width: "15%",
    borderRightWidth: 1,
    borderColor: "#111",
    padding: 3,
  },
  txnRemarks: {
    width: "33%",
    borderRightWidth: 1,
    borderColor: "#111",
    padding: 3,
  },
  txnBy: { width: "18%", borderRightWidth: 1, borderColor: "#111", padding: 3 },
  txnAmount: { width: "12%", padding: 3, textAlign: "right" },
  txnEmpty: { width: "100%", textAlign: "center", padding: 4 },
});

export default SaleInvoiceExport;
