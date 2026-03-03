import { Document, Page, PDFViewer, StyleSheet, Text, View } from "@react-pdf/renderer";

interface TransactionItem {
  id?: number;
  amount: number;
  mode: string;
  remarks?: string;
  receivedBy: string;
  date: string;
}

interface ReceiptProps {
  customer: {
    name: string;
    uhid?: string;
    genderAge?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  receipt: {
    number: string;
    date: string;
    invoiceNo?: string;
    srn?: string;
  };
  transactions: TransactionItem[];
}

const money = (value: number) => `Rs. ${value.toFixed(2)}`;

const TransactionReceiptExport = (data: ReceiptProps) => {
  return (
    <PDFViewer className="w-full h-full">
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.frame}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>PAYMENT RECEIPT</Text>
            </View>

            <View style={styles.infoTable}>
              <InfoRow label1="Patient Name" value1={data.customer.name || "-"} label2="UHID" value2={data.customer.uhid || "-"} />
              <InfoRow label1="Age / Gender" value1={data.customer.genderAge || "-"} label2="Mobile No." value2={data.customer.phone || "-"} />
              <InfoRow label1="Address" value1={data.customer.address || "-"} label2="" value2="" />
            </View>

            <View style={styles.bannerRow}>
              <Text style={styles.bannerText}>PAYMENT CREDITED TO ORGANISATION</Text>
            </View>

            {data.transactions.map((txn, index) => (
              <View key={`${txn.id ?? index}`} style={styles.receiptTable}>
                <KeyValueRow label="SRN" value={data.receipt.srn || "-"} />
                <KeyValueRow label="INVOICE NO." value={data.receipt.invoiceNo || "-"} />
                <KeyValueRow
                  label="RECEIPT NO."
                  value={
                    data.transactions.length > 1
                      ? `${data.receipt.number}-${index + 1}`
                      : data.receipt.number
                  }
                />
                <KeyValueRow label="PAYMENT ON" value={txn.date || data.receipt.date} />
                <KeyValueRow label="RECEIVED BY" value={txn.receivedBy || "-"} />
                <KeyValueRow label="PAYMENT AMOUNT" value={money(txn.amount)} />
                <KeyValueRow label="PAYMENT MODE" value={txn.mode || "-"} />
                <KeyValueRow label="REMARKS" value={txn.remarks || "-"} />
              </View>
            ))}
          </View>
        </Page>
      </Document>
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

const KeyValueRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.kvRow}>
    <Text style={styles.kvLabel}>{label}:</Text>
    <Text style={styles.kvValue}>{value}</Text>
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
  infoTable: { borderWidth: 1, borderColor: "#111", marginBottom: 6 },
  infoRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#111",
    minHeight: 10,
    alignItems: "stretch",
  },
  infoLabel: {
    width: "19%",
    borderRightWidth: 1,
    borderColor: "#111",
    paddingHorizontal: 4,
    fontFamily: "Helvetica-Bold",
    display: "flex",
    alignItems: "center",
    paddingVertical: 3,
  },
  infoValue: {
    width: "31%",
    borderRightWidth: 1,
    borderColor: "#111",
    display: "flex",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  bannerRow: {
    borderWidth: 1,
    borderColor: "#111",
    marginBottom: 6,
    paddingVertical: 3,
    paddingHorizontal: 4,
    display: "flex",
    justifyContent: "center",
  },
  bannerText: { textDecoration: "underline" },
  receiptTable: { borderWidth: 1, borderColor: "#111", marginBottom: 6 },
  kvRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#111",
    minHeight: 10,
    alignItems: "stretch",
  },
  kvLabel: {
    width: "50%",
    borderRightWidth: 1,
    borderColor: "#111",
    paddingHorizontal: 4,
    fontFamily: "Helvetica-Bold",
    display: "flex",
    alignItems: "center",
    paddingVertical: 3,
  },
  kvValue: {
    width: "50%",
    paddingHorizontal: 4,
    display: "flex",
    alignItems: "center",
    paddingVertical: 3,
  },
});

export default TransactionReceiptExport;
