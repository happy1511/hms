import { PatientValidatorType } from "@/validators/api/masters/patient";
import { startOfDay, subYears } from "date-fns";
import { useEffect, useRef } from "react";
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
  const isSettingDobFromAge = useRef(false);
  const prevDob = useRef<Date | undefined>(undefined);
  const dob = form.watch("dob") as unknown;
  const ageYears = form.watch("ageYears") as unknown;
  const parsedAgeYears =
    typeof ageYears === "number" && Number.isFinite(ageYears) ? ageYears : null;
  const isAgeValid = parsedAgeYears !== null && parsedAgeYears >= 0;

  useEffect(() => {
    if (!isAgeValid || parsedAgeYears === null) return;

    isSettingDobFromAge.current = true;
    form.setValue("dob", startOfDay(subYears(new Date(), parsedAgeYears)) as any);
    setTimeout(() => {
      isSettingDobFromAge.current = false;
    }, 0);
  }, [form, isAgeValid, parsedAgeYears]);

  useEffect(() => {
    const currentDob = (() => {
      if (!dob) return undefined;
      if (dob instanceof Date) return dob;
      const date = new Date(dob as any);
      return Number.isNaN(date.getTime()) ? undefined : date;
    })();
    const previousDob = prevDob.current;

    if (
      parsedAgeYears !== null &&
      currentDob &&
      previousDob &&
      currentDob.getTime() !== previousDob.getTime() &&
      !isSettingDobFromAge.current
    ) {
      form.setValue("ageYears", undefined);
    }

    prevDob.current = currentDob;
  }, [dob, form, parsedAgeYears]);

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
        required
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
        required
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
        required
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
        required
        disabled={isAgeValid}
      />
      <FormField
        control={form.control}
        label="Age (years)"
        name="ageYears"
        type="number"
        rules={{
          min: {
            value: 0,
            message: "Age must be greater than or equal to 0",
          },
        }}
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
        required
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
        required
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
        required
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
