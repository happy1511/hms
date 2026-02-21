"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import { Days, DoctorType, NameTitle, Status } from "@/generated/prisma/enums";
import {
  useCreateDoctor,
  useGetDoctor,
  useUpdateDoctor,
} from "@/hooks/query/doctor";
import { usePermissionsList } from "@/hooks/query/permission";
import { Doctor } from "@/lib/type";
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
      ...data,
      title: data.user.title,
      name: data.user.name,
      password: data.user.password,
      status: data.user.status,
      permissions: data.user.permissions,
    };
  } else {
    return {
      name: "",
      password: "",
      title: NameTitle["DR"],
      status: Status["active"],
      licenseNumber: "",
      doctorType: DoctorType["consulting"],
      email: "",
      phoneNumber: "",
      qualifications: "",
      specialization: "",
      yearsExperience: 0,
      availableDays: Object.values(Days).flatMap((d) => ({
        available: false,
        day: d,
      })),
      permissions,
    };
  }
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
    resolver: zodResolver(doctorValidator),
  });

  const onSubmit = (values: DoctorValidatorType) => {
    if (data) {
      update({ userId: Number(data.userId), ...values });
    } else {
      create(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-2">
          <FormField<DoctorValidatorType>
            label="Name"
            type="text"
            name="name"
            control={form.control}
            required
          />
          <FormField<DoctorValidatorType>
            label="License Number"
            type="text"
            name="licenseNumber"
            control={form.control}
            required
          />
          <FormField<DoctorValidatorType>
            label="Specialization"
            type="text"
            name="specialization"
            control={form.control}
            required
          />
          <FormField<DoctorValidatorType>
            label="Qualification"
            type="text"
            name="qualifications"
            control={form.control}
            required
          />
          <FormField<DoctorValidatorType>
            label="Experience (years)"
            type="number"
            name="yearsExperience"
            control={form.control}
            required
          />
          <FormField<DoctorValidatorType>
            label="Doctor Type"
            type="select"
            name="doctorType"
            options={Object.values(DoctorType).flatMap((d) => ({
              value: d,
              label: d,
            }))}
            control={form.control}
            required
          />
          <FormField<DoctorValidatorType>
            label="Department"
            type="text"
            name="department"
            control={form.control}
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
            required
          />
          <FormField<DoctorValidatorType>
            label="Consultancy Ending Time"
            type="time"
            name="consultationEndingTime"
            control={form.control}
            required
          />
          <FormField<DoctorValidatorType>
            label="Email"
            type="email"
            name="email"
            control={form.control}
            required
          />
          <FormField<DoctorValidatorType>
            label="Phone Number"
            type="text"
            name="phoneNumber"
            control={form.control}
            required
          />
          <FormField<DoctorValidatorType>
            label="Emergency Contact No"
            type="text"
            name="emergencyContact"
            control={form.control}
            required
          />
          <FormField<DoctorValidatorType>
            label="Password"
            type="text"
            name="password"
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
          {permissions?.map(({ module, actions }, moduleIndex) => (
            <div key={module.id} className="col-span-2 gap-1">
              <h3 className="text-tiny">{module.name}</h3>
              <div className="flex items-center gap-2">
                {actions.map((action, actionIndex) => (
                  <FormField
                    type="checkbox"
                    key={action.id}
                    control={form.control}
                    name={`permissions.${moduleIndex}.actions.${actionIndex}.assigned`}
                    label={action.name}
                  />
                ))}
              </div>
            </div>
          ))}
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
