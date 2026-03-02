import {
  Page,
  Text,
  View,
  Document,
  PDFViewer,
  StyleSheet,
} from "@react-pdf/renderer";

interface TransactionItem {
  amount: number;
  mode: string;
  remarks?: string;
  receivedBy: string;
  date: string;
}

interface ReceiptProps {
  customer: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };

  receipt: {
    number: string;
    date: string;
  };

  transactions: TransactionItem[];
}

/* ---------- CALCULATIONS ---------- */

const calcTotalPaid = (txns: TransactionItem[]) =>
  txns.reduce((sum, t) => sum + t.amount, 0);

/* ---------- COMPONENT ---------- */

const TransactionReceiptExport = (data: ReceiptProps) => {
  const totalPaid = calcTotalPaid(data.transactions);

  return (
    <PDFViewer className="w-full h-full">
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.frame}>
            {/* HEADER */}
            <View style={styles.header}>
              <View style={styles.meta}>
                <Text style={styles.title}>PAYMENT RECEIPT</Text>
                <Text>#{data.receipt.number}</Text>
                <Text>Date: {data.receipt.date}</Text>
              </View>
            </View>

            {/* CUSTOMER */}
            <View style={styles.customer}>
              <Text style={styles.sectionTitle}>Received From</Text>
              <Text style={styles.bold}>{data.customer.name}</Text>
              <Text>{data.customer.address}</Text>
              <Text>{data.customer.phone}</Text>
              <Text>{data.customer.email}</Text>
            </View>

            {/* TABLE HEADER */}
            <View style={styles.tableHeader}>
              <Text style={styles.colDate}>Date</Text>
              <Text style={styles.colMode}>Mode</Text>
              <Text style={styles.colRemarks}>Remarks</Text>
              <Text style={styles.colReceived}>Received By</Text>
              <Text style={styles.colAmount}>Amount</Text>
            </View>

            {/* TRANSACTION ROWS */}
            {data.transactions.map((txn, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.colDate}>{txn.date}</Text>
                <Text style={styles.colMode}>{txn.mode}</Text>
                <Text style={styles.colRemarks}>{txn.remarks || "-"}</Text>
                <Text style={styles.colReceived}>{txn.receivedBy}</Text>
                <Text style={styles.colAmount}>Rs. {txn.amount.toFixed(2)}</Text>
              </View>
            ))}

            {/* TOTAL PAID */}
            <View style={styles.paymentBox}>
              <Text style={styles.paymentLabel}>TOTAL RECEIVED</Text>
              <Text style={styles.paymentAmount}>Rs. {totalPaid.toFixed(2)}</Text>
            </View>

            {/* FOOTER */}
            <Text style={styles.footer}>
              This document confirms payment has been successfully received.
              Thank you for your business.
            </Text>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

const styles = StyleSheet.create({
  page: { backgroundColor: "#fff" },

  frame: {
    margin: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: "#222",
    borderStyle: "solid",
    fontFamily: "Helvetica",
    fontSize: 10,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  logo: { width: 120, height: 60 },

  meta: { textAlign: "right" },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold" },

  customer: { marginBottom: 18 },
  sectionTitle: { color: "#666", marginBottom: 4 },
  bold: { fontFamily: "Helvetica-Bold" },

  tableHeader: {
    flexDirection: "row",
    paddingVertical: 8,
    borderTopWidth: 1.5,
    borderBottomWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    fontFamily: "Helvetica-Bold",
  },

  category: {
    marginTop: 12,
    paddingTop: 4,
    borderTopWidth: 1,
    borderColor: "#000",
    fontFamily: "Helvetica-Bold",
  },

  row: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderColor: "#bbb",
  },

  colDesc: { width: "45%" },
  colQty: { width: "10%", textAlign: "center" },
  colPrice: { width: "15%", textAlign: "right" },
  colDiscount: { width: "15%", textAlign: "right" },
  colTotal: { width: "15%", textAlign: "right" },

  paymentBox: {
    marginTop: 26,
    alignItems: "center",
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    paddingVertical: 12,
  },

  paymentLabel: { fontSize: 10 },
  paymentAmount: { fontSize: 22, fontFamily: "Helvetica-Bold" },

  footer: {
    marginTop: 18,
    textAlign: "center",
    color: "#555",
    fontSize: 9,
  },
  colDate: { width: "18%" },
  colMode: { width: "18%" },
  colRemarks: { width: "28%" },
  colReceived: { width: "18%" },
  colAmount: { width: "18%", textAlign: "right" },
});

export default TransactionReceiptExport;
