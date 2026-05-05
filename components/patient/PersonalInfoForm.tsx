import { PatientValidatorType } from "@/validators/api/masters/patient";
import { UseFormReturn } from "react-hook-form";
import FormField from "../form-inputs/FormField";
import {
  BloodGroup,
  Gender,
  MaritalStatus,
  MlcInsuranceType,
  NameTitle,
} from "@/generated/prisma/enums";
import CustomButton from "../common/CustomButton";

const PersonalInfoForm = ({
  form,
  goNext,
}: {
  form: UseFormReturn<PatientValidatorType>;
  goNext: () => void;
}) => {
  const next = async () => {
    const isValid = await form.trigger([
      "title",
      "firstName",
      "lastName",
      "middleName",
      "preferredName",
      "dob",
      "identificationMark",
      "gender",
      "maritalStatus",
      "religion",
      "bloodGroup",
    ]);

    if (isValid) {
      goNext();
    }
  };
  return (
    <>
      <FormField
        control={form.control}
        label="Title"
        name="title"
        type="select"
        options={Object.values(NameTitle).map((g) => ({
          value: g,
          label: g,
        }))}
      />
      <FormField
        control={form.control}
        label="First Name"
        name="firstName"
        type="text"
      />
      <FormField
        control={form.control}
        label="Middle Name"
        name="middleName"
        type="text"
      />
      <FormField
        control={form.control}
        label="Last Name"
        name="lastName"
        type="text"
      />
      <FormField
        control={form.control}
        label="Preferred Name"
        name="preferredName"
        type="text"
      />
      <FormField
        control={form.control}
        label="Date of birth"
        name="dob"
        type="date"
      />
      <FormField
        control={form.control}
        label="Identification Mark"
        name="identificationMark"
        type="text"
      />
      <FormField
        control={form.control}
        label="Gender"
        name="gender"
        type="select"
        options={Object.values(Gender).map((g) => ({
          value: g,
          label: g,
        }))}
      />
      <FormField
        control={form.control}
        label="Marital Status"
        name="maritalStatus"
        type="select"
        options={Object.values(MaritalStatus).map((m) => ({
          value: m,
          label: m,
        }))}
      />
      <FormField
        control={form.control}
        label="Religion"
        name="religion"
        type="text"
      />

      <FormField
        control={form.control}
        label="Blood Group"
        name="bloodGroup"
        type="select"
        options={Object.values(BloodGroup).map((m) => ({
          value: m,
          label: m,
        }))}
      />
      <FormField
        control={form.control}
        label="Medico Legal (MLC)"
        name="isMlcPatient"
        type="checkbox"
      />
      <FormField
        control={form.control}
        label="Insurance Type"
        name="mlcInsuranceType"
        type="select"
        options={Object.values(MlcInsuranceType).map((value) => ({
          value,
          label: value,
        }))}
      />
      <FormField
        control={form.control}
        label="Policy / Card Number"
        name="mlcPolicyOrCardNumber"
        type="text"
      />
      <div className="flex justify-start col-span-2">
        <CustomButton type="button" onClick={next}>
          Next
        </CustomButton>
      </div>
    </>
  );
};

export default PersonalInfoForm;
