import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";

const parseInline = (html: string) => {
  // basic inline formatting
  return html
    .replace(/<strong>(.*?)<\/strong>/g, (_, t) => `**${t}**`)
    .replace(/<b>(.*?)<\/b>/g, (_, t) => `**${t}**`)
    .replace(/<br ?\/?>/g, "\n")
    .replace(/&nbsp;/g, " ");
};

export const RichTextRenderer = ({ html }: { html: string }) => {
  if (!html) return null;

  const blocks = html.split(/<\/p>|<\/ul>|<\/blockquote>|<hr>/gi);

  return (
    <View>
      {blocks.map((block, i) => {
        const clean = block.replace(/<[^>]+>/g, "").trim();

        if (!clean) return null;

        return (
          <Text key={i} style={{ marginBottom: 4 }}>
            {parseInline(clean)}
          </Text>
        );
      })}
    </View>
  );
};
const styles = StyleSheet.create({
  page: { backgroundColor: "#fff" },

  frame: {
    margin: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: "#000",
    fontFamily: "Helvetica",
    fontSize: 10,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
  },

  sectionTitle: {
    marginTop: 12,
    marginBottom: 4,
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
  },

  divider: {
    borderBottomWidth: 1,
    borderColor: "#000",
    marginVertical: 6,
  },

  footer: {
    marginTop: 20,
    textAlign: "right",
  },
});

const RadiologyReportPDF = ({ data }: any) => {
  const patient = data.patient;

  const reportHtml =
    data.results?.[0]?.value || data.test?.template?.content || "";

  return (
    <PDFViewer className="w-full h-full">
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.frame}>
            {/* HEADER */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Radiology Report</Text>
                <Text>Report ID: RPT-{data.id}</Text>
              </View>

              <View style={{ textAlign: "right" }}>
                <Text>{new Date(data.updatedAt).toLocaleDateString()}</Text>
                <Text>Department: {data.test.section}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* PATIENT INFO */}
            <Text style={styles.sectionTitle}>Patient Information</Text>
            <Text>
              Name: {patient.firstName} {patient.lastName}
            </Text>
            <Text>Gender: {patient.gender}</Text>
            <Text>UHID: {patient.uhid}</Text>

            <View style={styles.divider} />

            {/* RICH TEXT REPORT */}
            <Text style={styles.sectionTitle}>Report Details</Text>

            <RichTextRenderer html={reportHtml} />

            {/* FOOTER */}
            <View style={styles.footer}>
              <Text>--------------------------</Text>
              <Text>Authorized Signatory</Text>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
};

export default RadiologyReportPDF;
