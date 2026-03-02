"use client";

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
    firstName?: string;
    lastName?: string;
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

const OpdConsultationExport = ({ data }: { data: ConsultationExportData }) => {
  const patientName = [data.patient?.firstName, data.patient?.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="bg-white text-black p-6 text-sm space-y-4">
      <div className="flex justify-between items-start border-b pb-3">
        <div>
          <h1 className="text-lg font-semibold">OPD Consultation</h1>
          <p>OPD ID: {valueOrDash(data.opdId)}</p>
          <p>
            Date: {formatDateOrDash(data.createdAt, true)}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold">Patient</p>
          <p>{valueOrDash(patientName)}</p>
          <p>Consultant: {valueOrDash(data.consultantDoctorName)}</p>
          <p>Referring: {valueOrDash(data.referringDoctorName)}</p>
        </div>
      </div>

      <section>
        <h2 className="font-semibold mb-2">Vitals</h2>
        <div className="grid grid-cols-3 gap-2">
          <p>Height: {valueOrDash(data.vitals?.height)}</p>
          <p>Weight: {valueOrDash(data.vitals?.weight)}</p>
          <p>BP: {valueOrDash(data.vitals?.bpMm)}/{valueOrDash(data.vitals?.bpHg)}</p>
          <p>Pulse: {valueOrDash(data.vitals?.pulse)}</p>
          <p>RBS: {valueOrDash(data.vitals?.rbs)}</p>
          <p>RR: {valueOrDash(data.vitals?.rr)}</p>
          <p>SpO2: {valueOrDash(data.vitals?.spo2)}</p>
          <p>Temp: {valueOrDash(data.vitals?.temp)}</p>
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Clinical Notes</h2>
        <p>Notes: {valueOrDash(data.notes)}</p>
        <p>General Examinations: {valueOrDash(data.generalExaminations)}</p>
        <p>Systemic Examinations: {valueOrDash(data.systemicExaminations)}</p>
        <p>Diagnosis: {valueOrDash(data.diagnosis)}</p>
        <p>Chronic Illness: {valueOrDash(data.chronicIllness)}</p>
      </section>

      <section className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="font-semibold mb-2">Advised Pathology Tests</h2>
          <ul className="list-disc pl-4">
            {(data.advisedPathologyTests || []).length ? (
              (data.advisedPathologyTests || []).map((test, idx) => (
                <li key={`${test.id ?? idx}-${idx}`}>{valueOrDash(test.name)}</li>
              ))
            ) : (
              <li>--</li>
            )}
          </ul>
        </div>
        <div>
          <h2 className="font-semibold mb-2">Advised Radiology Tests</h2>
          <ul className="list-disc pl-4">
            {(data.advisedRadiologyTests || []).length ? (
              (data.advisedRadiologyTests || []).map((test, idx) => (
                <li key={`${test.id ?? idx}-${idx}`}>{valueOrDash(test.name)}</li>
              ))
            ) : (
              <li>--</li>
            )}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Prescription</h2>
        <table className="w-full border border-black/20">
          <thead className="bg-black/5">
            <tr>
              <th className="text-left p-2 border">Drug</th>
              <th className="text-left p-2 border">Frequency</th>
              <th className="text-left p-2 border">Days</th>
              <th className="text-left p-2 border">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {(data.prescription?.drugs || []).length ? (
              (data.prescription?.drugs || []).map((drug, idx) => (
                <tr key={`${drug.name ?? idx}-${idx}`}>
                  <td className="p-2 border">{valueOrDash(drug.name)}</td>
                  <td className="p-2 border">{valueOrDash(drug.frequency)}</td>
                  <td className="p-2 border">{valueOrDash(drug.days)}</td>
                  <td className="p-2 border">{valueOrDash(drug.remarks)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-2 border" colSpan={4}>
                  --
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="font-semibold mb-2">Follow Up</h2>
        <p>
          After Days: {valueOrDash(data.prescription?.followUpAfterDays ?? null)}
        </p>
        <p>
          Follow Up Date:{" "}
          {formatDateOrDash(data.prescription?.followUpDate)}
        </p>
        <p>Follow Up Advice: {valueOrDash(data.prescription?.followUpAdvice)}</p>
        <p>Other Advice: {valueOrDash(data.prescription?.otherAdvice)}</p>
      </section>
    </div>
  );
};

export default OpdConsultationExport;
