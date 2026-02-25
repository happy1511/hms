import {
  Page,
  Text,
  View,
  Document,
  Image,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";

const flag = (value: any, range: string) => {
  if (!range || value === "") return "";
  const [low, high] = range.split("-").map(Number);
  if (value < low) return "L";
  if (value > high) return "H";
  return "";
};

const PathologyOrderExport = ({ data }: any) => (
  <PDFViewer className="w-full h-full">
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.frame}>
          {/* HEADER */}
          <View style={styles.header}>
            {data.lab.logo && <Image src={data.lab.logo} style={styles.logo} />}
            <View style={{ textAlign: "right" }}>
              <Text style={styles.labName}>{data.lab.name}</Text>
              <Text>{data.lab.address}</Text>
              <Text>{data.lab.phone}</Text>
              <Text>{data.lab.email}</Text>
            </View>
          </View>

          {/* PATIENT INFO */}
          <View style={styles.infoGrid}>
            <View>
              <Text>
                <Text style={styles.bold}>Patient:</Text> {data.patient.name}
              </Text>
              <Text>
                <Text style={styles.bold}>Gender:</Text> {data.patient.gender}
              </Text>
              <Text>
                <Text style={styles.bold}>Patient ID:</Text>{" "}
                {data.patient.patientId}
              </Text>
              <Text>
                <Text style={styles.bold}>Referred By:</Text> {data.doctor.name}
              </Text>
            </View>

            <View>
              <Text>
                <Text style={styles.bold}>Report No:</Text>{" "}
                {data.report.reportNo}
              </Text>
              <Text>
                <Text style={styles.bold}>Specimen:</Text>{" "}
                {data.report.specimen}
              </Text>
              <Text>
                <Text style={styles.bold}>Collected:</Text>{" "}
                {data.report.collectionDate}
              </Text>
              <Text>
                <Text style={styles.bold}>Reported:</Text>{" "}
                {data.report.reportDate}
              </Text>
            </View>
          </View>

          {/* TABLE HEADER */}
          <View style={styles.tableHeader}>
            <Text style={styles.colTest}>Test</Text>
            <Text style={styles.colResult}>Result</Text>
            <Text style={styles.colUnit}>Unit</Text>
            <Text style={styles.colRange}>Reference Range</Text>
            <Text style={styles.colFlag}>Flag</Text>
          </View>

          {/* TESTS */}
          {data.tests.map((group: any, gi: number) => (
            <View key={gi}>
              <Text style={styles.category}>{group.category}</Text>

              {group.items.map((t: any, i: number) => (
                <View style={styles.row} key={i}>
                  <Text style={styles.colTest}>{t.name}</Text>
                  <Text style={styles.colResult}>{t.result}</Text>
                  <Text style={styles.colUnit}>{t.unit}</Text>
                  <Text style={styles.colRange}>{t.range}</Text>
                  <Text style={styles.colFlag}>{flag(t.result, t.range)}</Text>
                </View>
              ))}
            </View>
          ))}

          {/* REMARKS */}
          {data.remarks && (
            <View style={styles.remarks}>
              <Text style={styles.bold}>Clinical Remarks</Text>
              <Text>{data.remarks}</Text>
            </View>
          )}

          {/* SIGNATURE */}
          <View style={styles.signature}>
            <Text>-----------------------------</Text>
            <Text style={styles.bold}>{data.pathologist}</Text>
            <Text>Pathologist</Text>
          </View>
        </View>
      </Page>
    </Document>
  </PDFViewer>
);

const styles = StyleSheet.create({
  page: { backgroundColor: "#fff" },

  frame: {
    margin: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: "#000",
    borderStyle: "solid",
    fontFamily: "Helvetica",
    fontSize: 10,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  logo: { width: 90, height: 60 },
  labName: { fontSize: 16, fontFamily: "Helvetica-Bold" },

  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  bold: { fontFamily: "Helvetica-Bold" },

  tableHeader: {
    flexDirection: "row",
    borderTopWidth: 1.5,
    borderBottomWidth: 1,
    paddingVertical: 6,
    fontFamily: "Helvetica-Bold",
  },

  category: {
    marginTop: 10,
    paddingTop: 4,
    borderTopWidth: 1,
    fontFamily: "Helvetica-Bold",
  },

  row: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderColor: "#bbb",
  },

  colTest: { width: "32%" },
  colResult: { width: "14%", textAlign: "right" },
  colUnit: { width: "14%" },
  colRange: { width: "30%" },
  colFlag: { width: "10%", textAlign: "center", fontFamily: "Helvetica-Bold" },

  remarks: {
    marginTop: 18,
    paddingTop: 6,
    borderTopWidth: 1,
  },

  signature: {
    marginTop: 40,
    alignItems: "flex-end",
  },
});

export default PathologyOrderExport;
