"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import FormField from "@/components/form-inputs/FormField";
import PermissionsSection from "@/components/user/PermissionsSection";
import UserProfileFields from "@/components/user/UserProfileFields";
import { Form } from "@/components/ui/form";
import {
  ActionType,
  Days,
  DoctorType,
  Gender,
  ModuleType,
  NameTitle,
  RoleType,
  Status,
} from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import {
  useCreateDoctor,
  useGetDoctor,
  useUpdateDoctor,
} from "@/hooks/query/doctor";
import { usePermissionsList } from "@/hooks/query/permission";
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

const getInitialValues = (
  permissions: DoctorValidatorType["permissions"],
  data?: Doctor,
): DoctorValidatorType => {
  if (data) {
    return {
      title: data.user.title,
      roleType: data.user.roleType,
      firstName: data.user.firstName,
      middleName: data.user.middleName || "",
      lastName: data.user.lastName,
      preferredName: data.user.preferredName,
      gender: data.user.gender,
      dob: data.user.dob ? new Date(data.user.dob) : undefined,
      maritalStatus: data.user.maritalStatus || undefined,
      location: data.user.location ?? null,
      contactNumber: data.user.contactNumber,
      email: data.user.email || data.email || "",
      identityType: data.user.identityType || undefined,
      identityNumber: data.user.identityNumber || "",
      qualifications: data.user.qualifications || data.qualifications || "",
      department: data.user.department || data.department || "",
      password: data.user.password,
      status: data.user.status,
      licenseNumber: data.licenseNumber || "",
      doctorType: data.doctorType,
      specialization: data.specialization || "",
      yearsExperience: data.yearsExperience || 0,
      designation: data.designation || "",
      consultationCharges: data.consultationCharges ?? 0,
      emergencyContact: data.emergencyContact || "",
      consultationStartingTime: data.consultationStartingTime || "",
      consultationEndingTime: data.consultationEndingTime || "",
      availableDays: (data.availableDays ||
        []) as DoctorValidatorType["availableDays"],
      permissions: data.user.permissions,
    };
  }

  return {
    title: NameTitle["DR"],
    roleType: RoleType.DOCTOR,
    firstName: "",
    middleName: "",
    lastName: "",
    preferredName: "",
    gender: Gender["Male"],
    dob: undefined,
    maritalStatus: undefined,
    location: null,
    contactNumber: "",
    email: "",
    identityType: undefined,
    identityNumber: "",
    qualifications: "",
    department: "",
    password: "",
    status: Status["active"],
    licenseNumber: "",
    doctorType: DoctorType["consulting"],
    specialization: "",
    yearsExperience: 0,
    designation: "",
    consultationCharges: 0,
    emergencyContact: "",
    consultationStartingTime: "",
    consultationEndingTime: "",
    availableDays: Object.values(Days).map((day) => ({
      available: false,
      day,
    })),
    permissions,
  };
};

const UpdateCreateForm = ({
  data,
  permissions,
}: {
  data?: Doctor;
  permissions: DoctorValidatorType["permissions"];
}) => {
  const { mutateAsync: create, isPending: creating } = useCreateDoctor();
  const { mutateAsync: update, isPending: updating } = useUpdateDoctor();

  const form = useForm<DoctorValidatorType>({
    defaultValues: getInitialValues(permissions, data),
    resolver: zodResolver(doctorValidator) as any,
  });
  const selectedDoctorType = form.watch("doctorType");
  const isConsulting = selectedDoctorType === DoctorType.consulting;

  const onSubmit = (values: any) => {
    if (data) {
      update({ userId: Number(data.userId), ...values });
    } else {
      create(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)}>
        <div className="grid grid-cols-2 gap-x-2">
          <UserProfileFields
            form={form as any}
            contactNumberReadOnly={Boolean(data)}
            emailRequired={isConsulting}
            qualificationsRequired={isConsulting}
            showRoleType
            roleTypeDisabled
          />
          <FormField<DoctorValidatorType>
            label="License Number"
            type="text"
            name="licenseNumber"
            control={form.control}
            required={isConsulting}
          />
          <FormField<DoctorValidatorType>
            label="Specialization"
            type="text"
            name="specialization"
            control={form.control}
            required={isConsulting}
          />
          <FormField<DoctorValidatorType>
            label="Experience (years)"
            type="number"
            name="yearsExperience"
            control={form.control}
            required={isConsulting}
          />
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
            label="Consultation Charges"
            type="number"
            name="consultationCharges"
            control={form.control}
            required={isConsulting}
          />
          <FormField<DoctorValidatorType>
            label="Designation"
            type="text"
            name="designation"
            control={form.control}
          />
          <FormField<DoctorValidatorType>
            label="Consultancy Starting Time"
            type="time"
            name="consultationStartingTime"
            control={form.control}
            required={isConsulting}
          />
          <FormField<DoctorValidatorType>
            label="Consultancy Ending Time"
            type="time"
            name="consultationEndingTime"
            control={form.control}
            required={isConsulting}
          />
          <FormField<DoctorValidatorType>
            label="Emergency Contact No"
            type="text"
            name="emergencyContact"
            control={form.control}
            required={isConsulting}
          />
          <FormField<DoctorValidatorType>
            label="Password"
            type="password"
            name="password"
            control={form.control}
            required={isConsulting}
          />
          <FormField<DoctorValidatorType>
            label="Status"
            type="select"
            name="status"
            options={Object.values(Status).map((s) => ({ value: s, label: s }))}
            control={form.control}
            required
          />
          <div className="col-span-2 gap-1">
            <h3 className="text-tiny">Available Days</h3>
            <div className="flex items-center gap-2">
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
          <PermissionsSection
            control={form.control}
            permissions={permissions as any}
          />
        </div>
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

  const { data, isLoading: fetchingUser } = useGetDoctor(doctorId);
  const { data: permissions, isLoading: fetchingPermission } =
    usePermissionsList(!doctorId);

  if (fetchingPermission || fetchingUser) {
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

  if (!permissions && !doctorId) {
    return <div />;
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
      {doctorId ? (
        <UpdateCreateForm
          data={data}
          permissions={data?.user.permissions || []}
        />
      ) : (
        <UpdateCreateForm permissions={permissions || []} />
      )}
    </CustomLayout>
  );
};

export default DoctorForm;
