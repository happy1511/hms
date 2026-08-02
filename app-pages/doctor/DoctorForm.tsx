"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import {
  ActionType,
  Days,
  DoctorType,
  Gender,
  ModuleType,
  NameTitle,
  Status,
} from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import {
  useCreateDoctor,
  useGetDoctor,
  useUpdateDoctor,
} from "@/hooks/query/doctor";
import { Doctor } from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import {
  doctorValidator,
  DoctorValidatorType,
} from "@/validators/api/masters/doctor";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";

const getInitialValues = (data?: Doctor): DoctorValidatorType => {
  if (data) {
    return {
      title: data.title || NameTitle.DR,
      firstName: data.firstName || "",
      middleName: data.middleName || "",
      lastName: data.lastName || "",
      gender: data.gender || Gender.Male,
      userType: data.userType || "Doctor",
      doctorType: data.doctorType || DoctorType.consulting,
      licenseNumber: data.licenseNumber || "",
      specialization: data.specialization || "",
      qualifications: data.qualifications || "",
      yearsExperience: data.yearsExperience || 0,
      department: data.department || "",
      designation: data.designation || "",
      consultationCharges: data.consultationCharges ?? 0,
      email: data.email || "",
      phoneNumber: data.phoneNumber || data.contactNumber || "",
      contactNumber: data.phoneNumber || data.contactNumber || "",
      emergencyContact: data.emergencyContact || "",
      consultationStartingTime: data.consultationStartingTime || "",
      consultationEndingTime: data.consultationEndingTime || "",
      status: data.status || Status.active,
      availableDays: (data.availableDays ||
        Object.values(Days).map((day) => ({
          available: false,
          day,
        }))) as DoctorValidatorType["availableDays"],
    };
  }

  return {
    title: NameTitle.DR,
    firstName: "",
    middleName: "",
    lastName: "",
    gender: Gender.Male,
    userType: "Doctor",
    doctorType: DoctorType.consulting,
    licenseNumber: "",
    specialization: "",
    qualifications: "",
    yearsExperience: 0,
    department: "",
    designation: "",
    consultationCharges: 0,
    email: "",
    phoneNumber: "",
    contactNumber: "",
    emergencyContact: "",
    consultationStartingTime: "",
    consultationEndingTime: "",
    status: Status.active,
    availableDays: Object.values(Days).map((day) => ({
      available: false,
      day,
    })),
  };
};

const UpdateCreateForm = ({ data }: { data?: Doctor }) => {
  const { mutateAsync: create, isPending: creating } = useCreateDoctor();
  const { mutateAsync: update, isPending: updating } = useUpdateDoctor();

  const form = useForm<DoctorValidatorType>({
    defaultValues: getInitialValues(data),
    resolver: zodResolver(doctorValidator),
  });

  const selectedDoctorType = form.watch("doctorType");
  const isConsulting = selectedDoctorType === DoctorType.consulting;

  const onSubmit = (values: DoctorValidatorType) => {
    if (data) {
      update({
        ...values,
        yearsExperience: Number(values.yearsExperience),
        consultationCharges: Number(values.consultationCharges),
      });
    } else {
      create(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <FormField<DoctorValidatorType>
            label="Doctor Type"
            type="select"
            name="doctorType"
            options={Object.values(DoctorType).map((d) => ({
              value: d,
              label: d,
            }))}
            control={form.control}
            required
          />

          <FormField<DoctorValidatorType>
            label="Status"
            type="select"
            name="status"
            options={Object.values(Status).map((s) => ({ value: s, label: s }))}
            control={form.control}
            required
          />
        </div>

        {isConsulting ? (
          <div className="grid grid-cols-2 gap-2">
            <FormField<DoctorValidatorType>
              label="Title"
              type="select"
              name="title"
              options={Object.values(NameTitle).map((t) => ({
                value: t,
                label: t,
              }))}
              control={form.control}
              required
            />

            <FormField<DoctorValidatorType>
              label="Gender"
              type="select"
              name="gender"
              options={Object.values(Gender).map((g) => ({
                value: g,
                label: g,
              }))}
              control={form.control}
              required
            />

            <FormField<DoctorValidatorType>
              label="First Name"
              type="text"
              name="firstName"
              control={form.control}
              required
            />

            <FormField<DoctorValidatorType>
              label="Middle Name"
              type="text"
              name="middleName"
              control={form.control}
            />

            <FormField<DoctorValidatorType>
              label="Last Name/Surname"
              type="text"
              name="lastName"
              control={form.control}
              required
            />

            <FormField<DoctorValidatorType>
              label="User Type"
              type="select"
              name="userType"
              options={[
                { value: "Doctor", label: "Doctor" },
                { value: "Doctor (Dental)", label: "Doctor (Dental)" },
                {
                  value: "Doctor (Dermatologist)",
                  label: "Doctor (Dermatologist)",
                },
              ]}
              control={form.control}
              required
            />

            <FormField<DoctorValidatorType>
              label="License Number"
              type="text"
              name="licenseNumber"
              control={form.control}
            />

            <FormField<DoctorValidatorType>
              label="Specialization"
              type="text"
              name="specialization"
              control={form.control}
            />

            <FormField<DoctorValidatorType>
              label="Qualifications"
              type="text"
              name="qualifications"
              control={form.control}
            />

            <FormField<DoctorValidatorType>
              label="Experience (years)"
              type="number"
              name="yearsExperience"
              control={form.control}
            />

            <FormField<DoctorValidatorType>
              label="Consultation Charges"
              type="number"
              name="consultationCharges"
              control={form.control}
            />

            <FormField<DoctorValidatorType>
              label="Phone Number"
              type="text"
              name="phoneNumber"
              control={form.control}
            />

            <FormField<DoctorValidatorType>
              label="Email"
              type="text"
              name="email"
              control={form.control}
            />

            <FormField<DoctorValidatorType>
              label="Consultancy Starting Time"
              type="time"
              name="consultationStartingTime"
              control={form.control}
            />

            <FormField<DoctorValidatorType>
              label="Consultancy Ending Time"
              type="time"
              name="consultationEndingTime"
              control={form.control}
            />

            <div className="col-span-2 gap-1">
              <h3 className="text-tiny font-semibold">Available Days</h3>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                {Object.values(Days).map((day, availableIndex) => (
                  <FormField
                    type="checkbox"
                    key={day}
                    control={form.control}
                    name={`availableDays.${availableIndex}.available`}
                    label={day}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <FormField<DoctorValidatorType>
              label="First Name / Full Name"
              type="text"
              name="firstName"
              control={form.control}
              required
            />

            <FormField<DoctorValidatorType>
              label="Phone Number"
              type="text"
              name="phoneNumber"
              control={form.control}
            />
          </div>
        )}

        <CustomButton disabled={creating || updating} type="submit">
          Submit
        </CustomButton>
      </form>
    </Form>
  );
};

const DoctorForm = () => {
  const { doctorId }: { doctorId?: string } = useParams();
  const { data: profile } = useProfile(false);
  const { data, isLoading: fetchingDoctor } = useGetDoctor(doctorId);

  if (fetchingDoctor) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon
          role="status"
          aria-label="Loading"
          className="size-4 animate-spin"
        />
      </div>
    );
  }

  if (!profile) {
    return <div />;
  }

  const canCreate = hasActionPermission(
    profile.data,
    ModuleType.DOCTOR_MASTER,
    ActionType.CREATE,
  );
  const canUpdate = hasActionPermission(
    profile.data,
    ModuleType.DOCTOR_MASTER,
    ActionType.UPDATE,
  );

  if ((doctorId && !canUpdate) || (!doctorId && !canCreate)) {
    return (
      <CustomLayout title={doctorId ? "Edit Doctor" : "Create Doctor"}>
        <NoPermission />
      </CustomLayout>
    );
  }

  return (
    <CustomLayout title={doctorId ? "Edit Doctor" : "Create Doctor"}>
      <UpdateCreateForm data={data} />
    </CustomLayout>
  );
};

export default DoctorForm;
