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
}

const SaleInvoiceExport = ({
  billNo,
  billDate,
  patientName,
  doctorName,
  lines,
  invoiceDiscount,
  invoiceTotal,
}: SaleInvoiceExportProps) => {
  const taxableSubTotal = lines.reduce((sum, l) => sum + l.taxableAmount, 0);
  const taxTotal = lines.reduce((sum, l) => sum + l.gstAmount, 0);
  const cGstTotal = lines.reduce((sum, l) => sum + l.cGstAmount, 0);
  const sGstTotal = lines.reduce((sum, l) => sum + l.sGstAmount, 0);
  const iGstTotal = lines.reduce((sum, l) => sum + l.iGstAmount, 0);

  return (
    <PDFViewer className="w-full h-full">
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.frame}>
            <View style={styles.header}>
              <Text style={styles.title}>PHARMACY SALE INVOICE</Text>
              <Text>Bill: {billNo}</Text>
              <Text>Date: {billDate}</Text>
            </View>

            <View style={styles.meta}>
              <Text>Patient: {patientName}</Text>
              <Text>Doctor: {doctorName || "-"}</Text>
            </View>

            <View style={styles.tableHeader}>
              <Text style={styles.colName}>Drug</Text>
              <Text style={styles.colSmall}>Batch</Text>
              <Text style={styles.colSmall}>Qty</Text>
              <Text style={styles.colSmall}>Rate</Text>
              <Text style={styles.colTiny}>Taxable</Text>
              <Text style={styles.colTiny}>CGST</Text>
              <Text style={styles.colTiny}>SGST</Text>
              <Text style={styles.colTiny}>IGST</Text>
              <Text style={styles.colTiny}>GST</Text>
              <Text style={styles.colTiny}>Total</Text>
            </View>

            {lines.map((line, index) => (
              <View key={index} style={styles.row}>
                <Text style={styles.colName}>{line.name}</Text>
                <Text style={styles.colSmall}>{line.batchNo}</Text>
                <Text style={styles.colSmall}>{line.qty}</Text>
                <Text style={styles.colSmall}>{line.rate.toFixed(2)}</Text>
                <Text style={styles.colTiny}>{line.taxableAmount.toFixed(2)}</Text>
                <Text style={styles.colTiny}>{line.cGstAmount.toFixed(2)}</Text>
                <Text style={styles.colTiny}>{line.sGstAmount.toFixed(2)}</Text>
                <Text style={styles.colTiny}>{line.iGstAmount.toFixed(2)}</Text>
                <Text style={styles.colTiny}>{line.gstAmount.toFixed(2)}</Text>
                <Text style={styles.colTiny}>{line.total.toFixed(2)}</Text>
              </View>
            ))}

            <View style={styles.totals}>
              <View style={styles.totalRow}>
                <Text>Taxable Subtotal</Text>
                <Text>{taxableSubTotal.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text>Tax Total</Text>
                <Text>{taxTotal.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text>CGST Total</Text>
                <Text>{cGstTotal.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text>SGST Total</Text>
                <Text>{sGstTotal.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text>IGST Total</Text>
                <Text>{iGstTotal.toFixed(2)}</Text>
              </View>
              <View style={styles.totalRow}>
                <Text>Invoice Discount</Text>
                <Text>{invoiceDiscount.toFixed(2)}</Text>
              </View>
              <View style={styles.grandRow}>
                <Text>Grand Total</Text>
                <Text>{invoiceTotal.toFixed(2)}</Text>
              </View>
            </View>
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
    borderWidth: 1,
    borderColor: "#000",
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: { marginBottom: 12 },
  title: { fontSize: 16, fontFamily: "Helvetica-Bold", marginBottom: 4 },
  meta: { marginBottom: 10 },
  tableHeader: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 6,
    fontFamily: "Helvetica-Bold",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    paddingVertical: 4,
  },
  colName: { width: "20%" },
  colSmall: { width: "8%", textAlign: "right" },
  colTiny: { width: "9%", textAlign: "right" },
  totals: { marginTop: 12, marginLeft: "52%" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    fontFamily: "Helvetica-Bold",
  },
});

export default SaleInvoiceExport;
