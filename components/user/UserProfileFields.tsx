"use client";

import FormField from "@/components/form-inputs/FormField";
import {
  Gender,
  IdentityType,
  MaritalStatus,
  NameTitle,
} from "@/generated/prisma/enums";
import { Control } from "react-hook-form";

type Props = {
  control: Control<any>;
  contactNumberReadOnly?: boolean;
};

const UserProfileFields = ({
  control,
  contactNumberReadOnly = false,
}: Props) => {
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
      <FormField label="Date of Birth" type="date" name="dob" control={control} />
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
      <FormField label="Address" type="text" name="address" control={control} />
      <FormField label="City" type="text" name="city" control={control} />
      <FormField label="Country" type="text" name="country" control={control} />
      <FormField label="State" type="text" name="state" control={control} />
      <FormField label="Postcode" type="text" name="postcode" control={control} />
      <FormField
        label="Contact Number"
        type="text"
        name="contactNumber"
        control={control}
        required
        readOnly={contactNumberReadOnly}
      />
      <FormField label="Email" type="email" name="email" control={control} />
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
      <FormField label="Education" type="text" name="education" control={control} />
      <FormField
        label="Qualifications"
        type="text"
        name="qualifications"
        control={control}
      />
      <FormField label="Department" type="text" name="department" control={control} />
    </>
  );
};

export default UserProfileFields;
