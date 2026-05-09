import InfoRow from "./InfoRow";

interface Props {
  customer: {
    name: string;
    uhid?: string;
    gender?: string;
    age?: string;
    relation?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  invoice: {
    number: string;
    date: string;
    opdNumber?: string;
    consultant?: string;
    referredBy?: string;
    status?: string;
  };
}

const CustomerInfo = ({ customer, invoice }: Props) => {
  return (
    <table className="w-full border-collapse">
      <tbody>
        <InfoRow
          leftLabel="Patient UHID"
          leftValue={customer.uhid || "-"}
          rightLabel="Date"
          rightValue={invoice.date}
          cellClassName="border-b-0"
        />
        <InfoRow
          leftLabel="Patient"
          leftValue={customer.name || "-"}
          rightLabel="OPD Number"
          rightValue={invoice.opdNumber || "-"}
          cellClassName="border-b-0"
        />
        <InfoRow
          leftLabel="Gender / Age"
          leftValue={`${customer.gender || "-"}${customer.age ? ` / ${customer.age}` : ""}`}
          rightLabel="Invoice No."
          rightValue={invoice.number}
          cellClassName="border-b-0"
        />
        <InfoRow
          leftLabel="Address"
          leftValue={customer.address || "-"}
          rightLabel="Consultant"
          rightValue={invoice.consultant || "-"}
          cellClassName="border-b-0"
        />
        <InfoRow
          leftLabel="Relation"
          leftValue={customer.relation || "-"}
          rightLabel="Referred By"
          rightValue={invoice.referredBy || "-"}
          cellClassName="border-b-0"
        />
        <InfoRow
          leftLabel="Mobile No."
          leftValue={customer.phone || "-"}
          rightLabel=""
          rightValue=""
        />
      </tbody>
    </table>
  );
};

export default CustomerInfo;
