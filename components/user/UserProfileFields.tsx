"use client";

import FormField from "@/components/form-inputs/FormField";
import {
  Gender,
  IdentityType,
  MaritalStatus,
  NameTitle,
  RoleType,
} from "@/generated/prisma/enums";
import { UseFormReturn } from "react-hook-form";
import LocationCascadeFields from "../patient/LocationCascadeFields";

type Props = {
  form: UseFormReturn<any>;
  contactNumberReadOnly?: boolean;
  emailRequired?: boolean;
  qualificationsRequired?: boolean;
  showRoleType?: boolean;
  roleTypeDisabled?: boolean;
};

const UserProfileFields = ({
  form,
  contactNumberReadOnly = false,
  emailRequired = false,
  qualificationsRequired = false,
  showRoleType = false,
  roleTypeDisabled = false,
}: Props) => {
  const { control } = form;

  return (
    <>
      <FormField
        label="Title"
        type="select"
        name="title"
        control={control}
        options={Object.keys(NameTitle).map((t) => ({ value: t, label: t }))}
        required
      />
      {showRoleType && (
        <FormField
          label="Role Type"
          type="select"
          name="roleType"
          control={control}
          options={Object.values(RoleType).map((value) => ({
            value,
            label: value.replaceAll("_", " "),
          }))}
          required
          disabled={Boolean(roleTypeDisabled)}
        />
      )}
      <FormField
        label="First Name"
        type="text"
        name="firstName"
        control={control}
        required
      />
      <FormField
        label="Middle Name"
        type="text"
        name="middleName"
        control={control}
      />
      <FormField
        label="Last Name"
        type="text"
        name="lastName"
        control={control}
        required
      />
      <FormField
        label="Preferred Name"
        type="text"
        name="preferredName"
        control={control}
        required
      />
      <FormField
        label="Gender"
        type="select"
        name="gender"
        control={control}
        options={Object.values(Gender).map((value) => ({
          value,
          label: value,
        }))}
        required
      />
      <FormField
        label="Date of Birth"
        type="date"
        name="dob"
        control={control}
      />
      <FormField
        label="Marital Status"
        type="select"
        name="maritalStatus"
        control={control}
        options={Object.values(MaritalStatus).map((value) => ({
          value,
          label: value,
        }))}
      />
      <LocationCascadeFields form={form} name="location" />
      <FormField
        label="Contact Number"
        type="text"
        name="contactNumber"
        control={control}
        required
        readOnly={contactNumberReadOnly}
      />
      <FormField
        label="Email"
        type="email"
        name="email"
        control={control}
        required={emailRequired}
      />
      <FormField
        label="Identity Type"
        type="select"
        name="identityType"
        control={control}
        options={Object.values(IdentityType).map((value) => ({
          value,
          label: value.replaceAll("_", " "),
        }))}
      />
      <FormField
        label="Identity Number"
        type="text"
        name="identityNumber"
        control={control}
      />
      <FormField
        label="Qualifications"
        type="text"
        name="qualifications"
        control={control}
        required={qualificationsRequired}
      />
      <FormField
        label="Department"
        type="text"
        name="department"
        control={control}
      />
    </>
  );
};

export default UserProfileFields;
