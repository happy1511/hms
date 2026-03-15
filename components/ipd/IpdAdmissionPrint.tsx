"use client";

import PrintToolbar from "@/components/common/PrintToolbar";
import CompanyPrintHeader from "@/components/common/CompanyPrintHeader";
import { AddressType, ContactType } from "@/generated/prisma/enums";
import { IPDType } from "@/lib/type";
import { cn, formatAge } from "@/lib/utils";
import { useMemo, useState } from "react";

const EN_DECLARATION_TEMPLATE = `I want to get my relative {{PATIENT_NAME}} admitted to MANASA GLOBAL HOSPITAL for treatment as per my wish. I have been fully informed about the possible risks involved in the related treatment and have strictly followed the rules of the hospital during admission. I have also been informed that :-
1. I will personally take care of the safety of my precious jewellery, mobile, purse etc. and the hospital administration will not be held responsible if they get lost and I I will not talk about anything.
2. I am aware of all the charges of the hospital and I have also been informed about the possible expenses. The cost of any type of treatment may increase or decrease.
I agree to pay all types of bills and receipts and will not raise any dispute with the hospital administration in this regard.
3. I will follow the rules related to attendants in the hospital premises and will cooperate in maintaining cleanliness in the hospital premises.
4. I will behave decently with the hospital staff, doctors, nurses and my language will never be abusive and will never speak to a maximum of two at a time. Only relatives will stay with the patient.
5. I willingly give permission to use the medicines and I also understand that any side effects of any medicine which may be idiosyncratic called drug reaction.
6. I give consent for MLC as per requirement.
I have been explained about my patient's illness. I am ready to have this operation done under anesthesia. I will undergo NSC and anesthesia during the operation. During the operation he also explained to me about the problems arising from anesthesia and the operation afterwards. I give consent for the operation. All these things have been explained to me in my own language.`;

const HI_DECLARATION_TEMPLATE = `में मेरे रिश्तेदार {{PATIENT_NAME}} को MANASA GLOBAL HOSPITAL मैं मेरी मर्जी से भर्ती करवाकर इलाज करवाना चाहता हूं। चाहती हूं।
संबंधित इलाज में होने वाले संभावित खतरों इत्यादि के बारे में मुझे पूर्ण जानकारी दी जा चुकी है में भर्ती के दौरान अस्पताल के नियमों का भली-भांति पालन करूंगा/करूंगी मुझे यह भी बतला दिया गया है कि :-
1. मेरे हमारे कीमती गहने, मोबाइल, पर्स इत्यादि की सुरक्षा का ध्यान में स्वयं रखूंगा/रखूंगी तथा गुम हो जाने पर अस्पताल प्रशासन जवाबदार नहीं होगा तथा में कोई भी बात नहीं करूंगा/ करूंगी।
2. में अस्पताल के सभी तरह के चार्जेस से वाकिफ हूं तथा मुझे संभावित खर्चे की जानकारी भी दी जा चुकी है किसी भी प्रकार के इलाज में खर्च बढ़ घट सकता
है मैं सभी तरह के बिलों रसीद के भुगतान की सहमति देता/देती हूं तथा इस संदर्भ में कोई विवाद अस्पताल प्रशासन से नहीं करूंगा/ करूंगी।
3. में अस्पताल परिसर में संबंधियों (attendant) से संबंधित नियमों का पालन करूंगा करूंगी तथा अस्पताल परिसर में स्वच्छता बनाए रखने में सहयोग करूंगा करूंगी।
4 . मैं अस्पताल के स्टाफ डॉक्टर, नर्सेज, से शालीनता से व्यवहार करूंगा/करूंगी वा मेरी भाषा कभी भी अपमानजनक नहीं होगी तथा एक बार में अधिकतम दो ही संबंधी मरीज के साथ रहेंगे।
5. में अपनी राजी खुशी से दवाइयों के उपयोग के अनुमति देता/देती हूं तथा मुझे यह भी मालूम है कि कोई भी दवाई के साइड इफेक्ट जिसे इडीओसिन्क्रेटिक ड्रग रिएक्शन कहते हैं ।
6. आवश्यकतानुसार एमएलसी के लिए सहमति प्रदान करता करती हूं ।
मुझे मेरे मरीज की बीमारी के बारे में समझा दिया गया है मैं यह ऑपरेशन बेहोशी की अवस्था में करवाने को तैयार हूं मैं ऑपरेशन के दौरान एनएससी आ एनेस्थीसिया के उपयोग की अनुमति प्रदान करता हूं मुझे ऑपरेशन के दौरान वह बाद में एनएसथीसिया बा ऑपरेशन से उत्पन्न होने वाली परेशानियों के बारे में भी समझा दिया गया है मैं ऑपरेशन की सहमति प्रदान करता हूं मुझे यह सभी बातें मेरी अपनी भाषा में समझा दी गई है।`;

const fillDeclaration = (template: string, patientName: string) => {
  const resolved = patientName?.trim() ? patientName.trim() : "--";
  return template.replaceAll("{{PATIENT_NAME}}", resolved);
};

const valueOrDash = (value?: unknown) => {
  if (value === null || value === undefined || value === "") return "--";
  return String(value);
};

const formatDateTime = (value?: unknown) => {
  if (!value) return "--";
  const d = new Date(value as any);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleString();
};

const Cell = ({
  children,
  className = "",
  as = "td",
  colSpan,
}: {
  children?: React.ReactNode;
  className?: string;
  as?: "td" | "th";
  colSpan?: number;
}) => {
  const Component = as;
  return (
    <Component
      colSpan={colSpan}
      className={cn("border border-black px-2 py-1 align-top", className)}
    >
      {children}
    </Component>
  );
};

const IpdAdmissionPrint = ({ data }: { data: IPDType }) => {
  const [fontSize, setFontSize] = useState(10);

  const patientName = useMemo(() => {
    const p: any = data.patient;
    return [p?.firstName, p?.lastName].filter(Boolean).join(" ");
  }, [data]);

  const patientUhid = (data.patient as any)?.uhid;

  const contact = useMemo(() => {
    const contacts: any[] = ((data.patient as any)?.contacts ?? []) as any[];
    const mobile = contacts.find((c) => c.type === ContactType.MOBILE)?.value;
    const phone = contacts.find((c) => c.type === ContactType.PHONE)?.value;
    return mobile || phone || "--";
  }, [data]);

  const address = useMemo(() => {
    const addresses: any[] = ((data.patient as any)?.addresses ?? []) as any[];
    const home =
      addresses.find((a) => a.type === AddressType.HOME) ?? addresses[0];
    if (!home) return "--";
    return [
      home.addressLineOne,
      home.addressLineTwo,
      home.addressLineThree,
      home.location?.city,
      home.location?.state,
      home.location?.postcode,
      home.location?.country,
    ]
      .filter(Boolean)
      .join(", ");
  }, [data]);

  const relationText = useMemo(() => {
    const rel = (data.patient as any)?.relations?.[0];
    if (!rel?.type || !rel?.name) return "";
    const type = String(rel.type)
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (m) => m.toUpperCase());
    return `${type} of - ${String(rel.name).trim()}`;
  }, [data]);

  const ageSex = useMemo(() => {
    const p: any = data.patient;
    const age = formatAge(p?.dob);
    const gender = p?.gender ? String(p.gender) : "--";
    const suffix = relationText ? `, ${relationText}` : "";
    return `${age}, ${gender}${suffix}`;
  }, [data, relationText]);

  const bedText = useMemo(() => {
    const bed: any = (data as any).bed;
    if (!bed) return "--";
    const dept = bed.room?.roomType?.department?.name;
    const roomType = bed.room?.roomType?.name;
    const room = bed.room?.name;
    const bedName = bed.name || bed.bedNumber;
    return [dept, roomType, room, bedName].filter(Boolean).join(" : ") || "--";
  }, [data]);

  const consultantName = (data.consultantDoctor as any)?.user?.name;
  const referredByName = (data.referringDoctor as any)?.user?.name;
  const enDeclaration = useMemo(
    () => fillDeclaration(EN_DECLARATION_TEMPLATE, patientName),
    [patientName],
  );
  const hiDeclaration = useMemo(
    () => fillDeclaration(HI_DECLARATION_TEMPLATE, patientName),
    [patientName],
  );

  return (
    <>
      <PrintToolbar fontSize={fontSize} onFontSizeChange={setFontSize} />
      <div style={{ fontSize }} className="w-full bg-white text-black">
        <div className="mx-auto max-w-6xl bg-white p-4 print:max-w-none print:p-0">
          <CompanyPrintHeader className="mb-2" />
          <table className="w-full border border-black border-collapse">
            <thead>
              <tr>
                <Cell as="th" colSpan={4} className="text-center font-semibold">
                  IN-PATIENT ADMISSION SHEET
                </Cell>
              </tr>
            </thead>
            <tbody>
              <tr>
                <Cell className="w-[18%] bg-[#f2f2f2] font-semibold">
                  Patient Name:
                </Cell>
                <Cell className="w-[42%]">
                  {valueOrDash(patientName)}{" "}
                  {patientUhid ? `- UHID: ${patientUhid}` : ""}
                </Cell>
                <Cell className="w-[18%] bg-[#f2f2f2] font-semibold">
                  IPD Number:
                </Cell>
                <Cell className="w-[22%]">{valueOrDash(data.id)}</Cell>
              </tr>
              <tr>
                <Cell className="bg-[#f2f2f2] font-semibold">Age/Sex:</Cell>
                <Cell>{valueOrDash(ageSex)}</Cell>
                <Cell className="bg-[#f2f2f2] font-semibold">Billing Type:</Cell>
                <Cell>{valueOrDash((data.invoice as any)?.billingType)}</Cell>
              </tr>
              <tr>
                <Cell className="bg-[#f2f2f2] font-semibold">Address:</Cell>
                <Cell colSpan={3}>{valueOrDash(address)}</Cell>
              </tr>
              <tr>
                <Cell className="bg-[#f2f2f2] font-semibold">Contact:</Cell>
                <Cell>{valueOrDash(contact)}</Cell>
                <Cell className="bg-[#f2f2f2] font-semibold">
                  Admission Date/Time:
                </Cell>
                <Cell>{formatDateTime((data as any)?.ipdDateTime)}</Cell>
              </tr>
              <tr>
                <Cell className="bg-[#f2f2f2] font-semibold">Consultant:</Cell>
                <Cell>{valueOrDash(consultantName)}</Cell>
                <Cell className="bg-[#f2f2f2] font-semibold">Bed:</Cell>
                <Cell>{valueOrDash(bedText)}</Cell>
              </tr>
              <tr>
                <Cell className="bg-[#f2f2f2] font-semibold">Referred By:</Cell>
                <Cell colSpan={3}>{valueOrDash(referredByName)}</Cell>
              </tr>
              <tr>
                <Cell className="bg-[#f2f2f2] font-semibold">
                  Past Medical History:
                </Cell>
                <Cell colSpan={3}>{valueOrDash((data as any)?.remarks)}</Cell>
              </tr>
              <tr>
                <Cell className="bg-[#f2f2f2] font-semibold">
                  Provisional Diagnosis:
                </Cell>
                <Cell colSpan={3}>--</Cell>
              </tr>
              <tr>
                <Cell
                  className="bg-[#f2f2f2] font-semibold text-center"
                  colSpan={2}
                >
                  Declaration (English)
                </Cell>
                <Cell
                  className="bg-[#f2f2f2] font-semibold text-center"
                  colSpan={2}
                >
                  घोषणा (Hindi)
                </Cell>
              </tr>
              <tr>
                <Cell colSpan={2} className="whitespace-pre-line text-[10px]">
                  {enDeclaration}
                </Cell>
                <Cell colSpan={2} className="whitespace-pre-line text-[10px]">
                  {hiDeclaration}
                </Cell>
              </tr>
              <tr>
                <Cell colSpan={4} className="pt-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="font-semibold">Signature:</div>
                      <div>Name:</div>
                      <div>Relation with Patient:</div>
                      <div>Signature:</div>
                      <div>Date and Time:</div>
                    </div>
                    <div className="space-y-2">
                      <div className="font-semibold text-right">&nbsp;</div>
                      <div className="text-right">&nbsp;</div>
                      <div className="text-right">&nbsp;</div>
                      <div className="text-right">&nbsp;</div>
                      <div className="text-right">&nbsp;</div>
                    </div>
                  </div>
                </Cell>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default IpdAdmissionPrint;
