import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import {
  AppointmentStatus,
  AppointmentType,
  Status,
} from "@/generated/prisma/enums";
import { useInfiniteDoctorList } from "@/hooks/query/doctor";
import {
  appointmentValidator,
  AppointmentValidatorType,
} from "@/validators/api/appointment/appointment";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import PatientSearchModal from "@/components/patient/PatientSearchModal";
import { useCreateAppointment } from "@/hooks/query/appointment";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import { Doctor, PaginatedResponse } from "@/lib/type";

const AppointmentForm = () => {
  const [doctorSearchValue, setDoctorSearchValue] = useState("");
  const { mutateAsync: createAppointment, isPending: creating } =
    useCreateAppointment();
  const doctorQuery = useInfiniteDoctorList(
    {
      doctorType: "consulting",
      name: doctorSearchValue,
      status: Status["active"],
    },
    20,
  );

  const form = useForm<AppointmentValidatorType>({
    defaultValues: {
      status: AppointmentStatus["SCHEDULED"],
    },
    resolver: zodResolver(appointmentValidator),
    reValidateMode: "onChange",
  });

  const patineName = form.watch("patientName");

  const onSubmit = (values: AppointmentValidatorType) => {
    const { patientName, ...rest } = values;
    createAppointment(rest);
  };

  return (
    <CustomLayout title="Book new Appointment">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 space-y-3 gap-x-2">
            <div>
              <div className="relative grid grid-cols-5 border border-black/15 rounded-[4px]">
                <Label className="text-tiny col-span-2 border-r border-black/15 px-2 bg-pink-50">
                  Appointment Type
                </Label>
                <div className="col-span-3">
                  <PatientSearchModal
                    trigger={
                      <CustomButton className="w-full bg-white text-black hover:bg-background hover:text-black flex justify-start">
                        {patineName ? patineName : "Select or Register Patient"}
                      </CustomButton>
                    }
                    actions={(row, setOpen) => {
                      return (
                        <CustomButton
                          onClick={() => {
                            form.setValue("patientId", Number(row.id));
                            form.setValue(
                              "patientName",
                              `${row.patient.firstName} ${row.patient.lastName}`,
                            );
                            setOpen(false);
                          }}
                        >
                          Select
                        </CustomButton>
                      );
                    }}
                  />
                </div>
              </div>
              <ErrorMessage
                name="patientId"
                errors={form.formState.errors}
                render={({ message }) => (
                  <p className="font-semibold text-tiny! ms-1">{message}</p>
                )}
              />
            </div>
            <div className="relative">
              <div className="relative grid grid-cols-5 border border-black/15 rounded-[4px]">
                <Label className="text-tiny col-span-2 border-r border-black/15 px-2 bg-pink-50">
                  Appointment Type
                </Label>
                <div className="col-span-3">
                  <FormField<AppointmentValidatorType>
                    type="select"
                    name="type"
                    control={form.control}
                    required
                    options={Object.values(AppointmentType).map((a) => ({
                      label: a,
                      value: a,
                    }))}
                    hideError
                  />
                </div>
              </div>
              <ErrorMessage
                name="type"
                errors={form.formState.errors}
                render={({ message }) => (
                  <p className="font-semibold text-tiny! ms-1">{message}</p>
                )}
              />
            </div>
            <div>
              <div className="relative grid grid-cols-5 border border-black/15 rounded-[4px]">
                <Label className="text-tiny col-span-2 border-r border-black/15 px-2 bg-pink-50">
                  Appt. Date/Time
                </Label>
                <div className="col-span-3">
                  <FormField<AppointmentValidatorType>
                    type="dateTime"
                    name="appointmentDate"
                    control={form.control}
                    required
                    minDate={new Date()}
                    allowFutureDates
                    hideError
                  />
                </div>
              </div>
              <ErrorMessage
                name="appointmentDate"
                errors={form.formState.errors}
                render={({ message }) => (
                  <p className="font-semibold text-tiny! ms-1">{message}</p>
                )}
              />
            </div>
            <div>
              <div className="relative grid grid-cols-5 border border-black/15 rounded-[4px]">
                <Label className="text-tiny col-span-2 border-r border-black/15 px-2 bg-pink-50">
                  Consultant Doctor
                </Label>
                <div className="col-span-3">
                  <FormInfiniteSelect<
                    Doctor,
                    PaginatedResponse<Doctor>,
                    string,
                    AppointmentValidatorType
                  >
                    name="doctor"
                    control={form.control}
                    query={doctorQuery}
                    getItems={(data) => data?.data}
                    labelKey={(data) => data.user?.name}
                    valueKey={(data) => data.userId}
                    search={doctorSearchValue}
                    onSearchChange={setDoctorSearchValue}
                    required
                    hideError
                  />
                </div>
              </div>
              <ErrorMessage
                name="doctor"
                errors={form.formState.errors}
                render={({ message }) => (
                  <p className="font-semibold text-tiny! ms-1">{message}</p>
                )}
              />
            </div>
            <div className="md:col-span-2">
              <div className="relative grid grid-cols-5 border border-black/15 rounded-[4px]">
                <Label className="text-tiny col-span-1 border-r border-black/15 px-2 bg-pink-50">
                  Remarks
                </Label>
                <div className="col-span-4">
                  <FormField<AppointmentValidatorType>
                    type="text"
                    name="remarks"
                    control={form.control}
                    required
                    hideError
                  />
                </div>
              </div>
              <ErrorMessage
                name="remarks"
                errors={form.formState.errors}
                render={({ message }) => (
                  <p className="font-semibold text-tiny! ms-1">{message}</p>
                )}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <CustomButton type="submit" disabled={creating}>
              Book an Appointment
            </CustomButton>
            <CustomButton
              type="button"
              onClick={() => form.reset({})}
              variant="outline"
              className="bg-white text-black"
            >
              Cancel
            </CustomButton>
          </div>
        </form>
      </Form>
    </CustomLayout>
  );
};

export default AppointmentForm;
