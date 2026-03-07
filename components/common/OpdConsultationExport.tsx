"use client";

import {
  Document,
  Page,
  PDFViewer,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

type PrescribedDrugLine = {
  name?: string;
  frequency?: unknown;
  days?: unknown;
  remarks?: string | null;
};

type AdviceItem = {
  id?: unknown;
  name?: unknown;
};

type ConsultationExportData = {
  opdId?: unknown;
  createdAt?: unknown;
  patient?: {
    id?: number;
    firstName?: string;
    lastName?: string;
    uhid?: string;
    gender?: string;
    contacts?: { type?: string; value?: string }[];
    addresses?: {
      addressLineOne?: string | null;
      addressLineTwo?: string | null;
      addressLineThree?: string | null;
      location?: {
        city?: string | null;
        state?: string | null;
        country?: string | null;
        postcode?: string | null;
      } | null;
    }[];
  };
  consultantDoctorName?: string | null;
  referringDoctorName?: string | null;
  vitals?: {
    height?: unknown;
    weight?: unknown;
    bpMm?: unknown;
    bpHg?: unknown;
    pulse?: unknown;
    rbs?: unknown;
    rr?: unknown;
    spo2?: unknown;
    temp?: unknown;
  };
  notes?: string | null;
  generalExaminations?: string | null;
  systemicExaminations?: string | null;
  diagnosis?: string | null;
  chronicIllness?: string | null;
  advisedPathologyTests?: AdviceItem[] | null;
  advisedRadiologyTests?: AdviceItem[] | null;
  prescription?: {
    drugs?: PrescribedDrugLine[];
    followUpAfterDays?: unknown;
    followUpDate?: unknown;
    followUpAdvice?: string | null;
    otherAdvice?: string | null;
  };
};

const valueOrDash = (value?: unknown) => {
  if (value === null || value === undefined || value === "") return "--";
  return String(value);
};

const formatDateOrDash = (value?: unknown, withTime: boolean = false) => {
  if (!value) return "--";
  const date = new Date(value as string | number | Date);
  if (Number.isNaN(date.getTime())) return "--";
  return withTime ? date.toLocaleString() : date.toLocaleDateString();
};

const listToText = (items?: AdviceItem[] | null) => {
  if (!items?.length) return "--";
  return items.map((item) => valueOrDash(item.name)).join(", ");
};

const stripHtmlToText = (value?: unknown) => {
  if (value === null || value === undefined || value === "") return "--";
  const normalized = String(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  return normalized || "--";
};

const ConsultationDocument = ({ data }: { data: ConsultationExportData }) => {
  const patientName = [data.patient?.firstName, data.patient?.lastName]
    .filter(Boolean)
    .join(" ");
  const mobile =
    data.patient?.contacts?.find((contact) => contact.type === "MOBILE")
      ?.value ||
    data.patient?.contacts?.find((contact) => contact.type === "PHONE")
      ?.value ||
    "--";
  const address = (() => {
    const homeAddress = data.patient?.addresses?.[0];
    if (!homeAddress) return "--";
    return [
      homeAddress.addressLineOne,
      homeAddress.addressLineTwo,
      homeAddress.addressLineThree,
      homeAddress.location?.city,
      homeAddress.location?.state,
      homeAddress.location?.postcode,
      homeAddress.location?.country,
    ]
      .filter(Boolean)
      .join(", ");
  })();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.frame}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>OPD CONSULTATION</Text>
          </View>

          <View style={styles.infoTable}>
            <InfoRow
              label1="UHID"
              value1={valueOrDash(data.patient?.uhid)}
              label2="Date"
              value2={formatDateOrDash(data.createdAt, true)}
            />
            <InfoRow
              label1="Patient"
              value1={valueOrDash(patientName)}
              label2="OPD Number"
              value2={valueOrDash(data.opdId)}
            />
            <InfoRow
              label1="Gender"
              value1={valueOrDash(data.patient?.gender)}
              label2="Consultant"
              value2={valueOrDash(data.consultantDoctorName)}
            />
            <InfoRow
              label1="Mobile No."
              value1={valueOrDash(mobile)}
              label2="Referred By"
              value2={valueOrDash(data.referringDoctorName)}
            />
            <InfoRow
              label1="Address"
              value1={valueOrDash(address)}
              label2=""
              value2=""
            />
          </View>

          <View style={styles.sectionBlock}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Vitals</Text>
            </View>
            <View style={styles.rowWrap}>
              <KV label="Height" value={data.vitals?.height} />
              <KV label="Weight" value={data.vitals?.weight} />
              <KV
                label="BP"
                value={`${valueOrDash(data.vitals?.bpMm)}/${valueOrDash(data.vitals?.bpHg)}`}
              />
              <KV label="Pulse" value={data.vitals?.pulse} />
              <KV label="RBS" value={data.vitals?.rbs} />
              <KV label="RR" value={data.vitals?.rr} />
              <KV label="SpO2" value={data.vitals?.spo2} />
              <KV label="Temp" value={data.vitals?.temp} />
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Clinical Notes</Text>
            </View>
            <BodyRow label="Notes" value={data.notes} />
            <BodyRow label="General Examination" value={data.generalExaminations} />
            <BodyRow label="Systemic Examination" value={data.systemicExaminations} />
            <BodyRow label="Diagnosis" value={data.diagnosis} />
            <BodyRow label="Chronic Illness" value={data.chronicIllness} />
          </View>

          <View style={styles.sectionBlock}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Advised Tests</Text>
            </View>
            <BodyRow
              label="Pathology"
              value={listToText(data.advisedPathologyTests)}
            />
            <BodyRow
              label="Radiology"
              value={listToText(data.advisedRadiologyTests)}
            />
          </View>

          <View style={styles.sectionBlock}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Prescription</Text>
            </View>
            <View style={styles.tableHeader}>
              <Text style={styles.drugCol}>Drug</Text>
              <Text style={styles.smallCol}>Frequency</Text>
              <Text style={styles.smallCol}>Days</Text>
              <Text style={styles.remarkCol}>Remarks</Text>
            </View>
            {(data.prescription?.drugs?.length
              ? data.prescription.drugs
              : [{ name: "--", frequency: "--", days: "--", remarks: "--" }]
            ).map((drug, index) => (
              <View key={`drug-${index}`} style={styles.tableRow}>
                <Text style={styles.drugCol}>{valueOrDash(drug.name)}</Text>
                <Text style={styles.smallCol}>{valueOrDash(drug.frequency)}</Text>
                <Text style={styles.smallCol}>{valueOrDash(drug.days)}</Text>
                <Text style={styles.remarkCol}>{valueOrDash(drug.remarks)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.sectionBlock}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Follow Up</Text>
            </View>
            <BodyRow
              label="After Days"
              value={valueOrDash(data.prescription?.followUpAfterDays)}
            />
            <BodyRow
              label="Follow Up Date"
              value={formatDateOrDash(data.prescription?.followUpDate)}
            />
            <BodyRow
              label="Follow Up Advice"
              value={stripHtmlToText(data.prescription?.followUpAdvice)}
            />
            <BodyRow
              label="Other Advice"
              value={stripHtmlToText(data.prescription?.otherAdvice)}
            />
          </View>
        </View>
      </Page>
    </Document>
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

const KV = ({ label, value }: { label: string; value?: unknown }) => (
  <View style={styles.kvItem}>
    <Text style={styles.kvLabel}>{label}:</Text>
    <Text style={styles.kvValue}>{valueOrDash(value)}</Text>
  </View>
);

const BodyRow = ({ label, value }: { label: string; value?: unknown }) => (
  <View style={styles.bodyRow}>
    <Text style={styles.bodyLabel}>{label}:</Text>
    <Text style={styles.bodyValue}>{stripHtmlToText(value)}</Text>
  </View>
);

const OpdConsultationExport = ({ data }: { data: ConsultationExportData }) => {
  return (
    <PDFViewer className="w-full h-full">
      <ConsultationDocument data={data} />
    </PDFViewer>
  );
};

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
    borderBottomWidth: 1,
    borderColor: "#111",
    backgroundColor: "#f2f2f2",
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  sectionTitle: { fontFamily: "Helvetica-Bold" },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  kvItem: {
    width: "25%",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#111",
    paddingVertical: 3,
    paddingHorizontal: 4,
    minHeight: 20,
  },
  kvLabel: { fontFamily: "Helvetica-Bold" },
  kvValue: { marginTop: 1 },
  bodyRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#111",
    minHeight: 16,
    alignItems: "stretch",
  },
  bodyLabel: {
    width: "26%",
    borderRightWidth: 1,
    borderColor: "#111",
    fontFamily: "Helvetica-Bold",
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  bodyValue: {
    width: "74%",
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#111",
    backgroundColor: "#f8f8f8",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#111",
  },
  drugCol: {
    width: "38%",
    borderRightWidth: 1,
    borderColor: "#111",
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
  smallCol: {
    width: "16%",
    borderRightWidth: 1,
    borderColor: "#111",
    paddingHorizontal: 4,
    paddingVertical: 3,
    textAlign: "center",
  },
  remarkCol: {
    width: "30%",
    paddingHorizontal: 4,
    paddingVertical: 3,
  },
});

export default OpdConsultationExport;
