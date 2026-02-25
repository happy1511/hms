import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";

interface Item {
  description: string;
  qty: number;
  price: number;
  discount: number;
}

interface BillingItem {
  name: string;
  items: Item[];
}

interface Props {
  customer: { name: string; address?: string; phone?: string; email?: string };
  invoice: { number: string; date: string };
  billingItems: BillingItem[];
  discount: number;
  paid: number;
}

const lineGross = (item: Item) => item.qty * item.price;
const lineNet = (item: Item) => lineGross(item) - (item.discount || 0);

const calcCategoryTotal = (items: Item[]) =>
  items.reduce((sum, item) => sum + lineNet(item), 0);

const calcSubtotal = (categories: BillingItem[]) =>
  categories.reduce((sum, cat) => sum + calcCategoryTotal(cat.items), 0);

const calcItemsDiscount = (categories: BillingItem[]) =>
  categories.reduce(
    (sum, cat) => sum + cat.items.reduce((s, i) => s + (i.discount || 0), 0),
    0,
  );

const InvoiceExport = (data: Props) => {
  const subtotal = calcSubtotal(data.billingItems);
  const itemDiscount = calcItemsDiscount(data.billingItems);
  const total = subtotal - data.discount;
  const due = total - data.paid;
  return (
    <PDFViewer className="w-full h-full">
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.frame}>
            {/* HEADER */}
            <View style={styles.header}>
              {/* <Image src={data.company.logo} style={styles.logo} /> */}

              <View style={styles.invoiceMeta}>
                <Text style={styles.invoiceTitle}>INVOICE</Text>
                <Text>#{data.invoice.number}</Text>
                <Text>Date: {data.invoice.date}</Text>
                {/* <Text>Due: {data.invoice.dueDate}</Text> */}
              </View>
            </View>

            {/* COMPANY + CUSTOMER */}
            <View style={styles.infoRow}>
              <View style={styles.box}>
                <Text style={styles.boxTitle}>From</Text>
                {/* <Text style={styles.bold}>{data.company.name}</Text> */}
                {/* <Text>{data.company.address}</Text> */}
                {/* <Text>{data.company.phone}</Text> */}
                {/* <Text>{data.company.email}</Text> */}
              </View>

              <View style={styles.box}>
                <Text style={styles.boxTitle}>Bill To</Text>
                <Text style={styles.bold}>{data.customer.name}</Text>
                <Text>{data.customer.address}</Text>
                <Text>{data.customer.phone}</Text>
                <Text>{data.customer.email}</Text>
              </View>
            </View>

            {/* TABLE HEADER */}
            <View style={styles.tableHeader} fixed>
              <Text style={styles.colDesc}>Item</Text>
              <Text style={styles.colQty}>Qty</Text>
              <Text style={styles.colPrice}>Price</Text>ac
              <Text style={styles.colDiscount}>Discount</Text>
              <Text style={styles.colTotal}>Total</Text>
            </View>

            {/* CATEGORY GROUPS */}
            {data.billingItems.map((cat, idx) => {
              const catTotal = calcCategoryTotal(cat.items);

              return (
                <View key={idx} wrap={false}>
                  <Text style={styles.category}>{cat.name}</Text>

                  {cat.items.map((item, i) => (
                    <View style={styles.row} key={i}>
                      <Text style={styles.colDesc}>{item.description}</Text>
                      <Text style={styles.colQty}>{item.qty}</Text>
                      <Text style={styles.colPrice}>
                        ${item.price.toFixed(2)}
                      </Text>
                      <Text style={styles.colDiscount}>
                        -${(item.discount || 0).toFixed(2)}
                      </Text>
                      <Text style={styles.colTotal}>
                        ${lineNet(item).toFixed(2)}
                      </Text>
                    </View>
                  ))}

                  <View style={styles.categoryTotal}>
                    <Text>Subtotal</Text>
                    <Text>${catTotal.toFixed(2)}</Text>
                  </View>
                </View>
              );
            })}

            {/* TOTALS */}
            <View style={styles.totalsCard}>
              <View style={styles.summaryRow}>
                <Text>Items Discount</Text>
                <Text>- ${itemDiscount.toFixed(2)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text>Subtotal</Text>
                <Text>${subtotal.toFixed(2)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text>Invoice Discount</Text>
                <Text>- ${data.discount.toFixed(2)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text>Total</Text>
                <Text>${total.toFixed(2)}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text>Paid</Text>
                <Text>${data.paid.toFixed(2)}</Text>
              </View>

              <View style={styles.dueRow}>
                <Text>Amount Due</Text>
                <Text>${due.toFixed(2)}</Text>
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
    borderWidth: 1.5,
    borderColor: "#222",
    borderStyle: "solid",
    flex: 1,
    fontFamily: "Helvetica",
    fontSize: 10,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  logo: { width: 120, height: 60 },

  invoiceMeta: { textAlign: "right" },
  invoiceTitle: { fontSize: 20, fontFamily: "Helvetica-Bold" },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  box: { width: "48%" },
  boxTitle: { marginBottom: 4, color: "#666" },
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
    marginTop: 14,
    paddingTop: 6,
    borderTopWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    fontFamily: "Helvetica-Bold",
  },

  row: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 0.7,
    borderColor: "#bbb",
    borderStyle: "solid",
  },

  colDesc: { width: "40%" },
  colQty: { width: "10%", textAlign: "center" },
  colPrice: { width: "15%", textAlign: "right" },
  colDiscount: { width: "15%", textAlign: "right" },
  colTotal: { width: "20%", textAlign: "right" },

  categoryTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: "#000",
    borderStyle: "solid",
    fontFamily: "Helvetica-Bold",
  },

  totalsCard: {
    marginTop: 24,
    marginLeft: "55%",
    paddingTop: 8,
    borderTopWidth: 1.5,
    borderColor: "#000",
    borderStyle: "solid",
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 2,
  },

  dueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1.5,
    borderBottomWidth: 2,
    borderColor: "#000",
    borderStyle: "solid",
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },
});

export default InvoiceExport;
