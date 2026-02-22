"use client";

import { CustomAlert } from "@/components/common/CustomAlert";
import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import FormField from "@/components/form-inputs/FormField";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { RadiologyTest } from "@/generated/prisma/client";
import {
  useGetConsultationFile,
  useUpdateOpdConsultation,
} from "@/hooks/query/opd";
import { useInfinitePathologyTestsList } from "@/hooks/query/pathology";
import { useInfiniteRadiologyTestsList } from "@/hooks/query/radiology";
import {
  ColumnDefWithClass,
  PaginatedResponse,
  PathologyTestDataType,
} from "@/lib/type";
import {
  consultantFileType,
  consultationFileValidator,
  prescribedDrugType,
  prescribedDrugValidator,
} from "@/validators/api/opd/opd";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit2, LoaderIcon, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  useFieldArray,
  UseFieldArrayRemove,
  useForm,
  UseFormReturn,
} from "react-hook-form";

const Actions = ({
  data,
  remove,
  index,
  form,
}: {
  form: UseFormReturn<prescribedDrugType>;
  data: prescribedDrugType;
  remove: UseFieldArrayRemove;
  index: number;
}) => {
  return (
    <>
      <Button
        variant="outline"
        className="h-auto shadow-none p-1 cursor-pointer"
        onClick={() => form.reset({ ...data, index })}
        type="button"
      >
        <Edit2 className="size-2.5 text-destructive" />
      </Button>
      <CustomAlert
        triggerButton={
          <Button
            variant="outline"
            className="h-auto shadow-none p-1 cursor-pointer"
            type="button"
          >
            <Trash2 className="size-2.5 text-destructive" />
          </Button>
        }
        title="Delete item?"
        description="Are you sure you want to delete item?"
        cancelText="Cancel"
        confirmText="Delete"
        handleConfirm={() => remove(index)}
      />
    </>
  );
};

const Prescription = ({
  form,
}: {
  form: UseFormReturn<consultantFileType>;
}) => {
  const { append, update, remove } = useFieldArray({
    name: "prescription.drugs",
    control: form.control,
  });

  const prescriptionForm = useForm<prescribedDrugType>({
    resolver: zodResolver(prescribedDrugValidator),
  });

  const addedDrugs = form.watch("prescription.drugs");
  const editingIndex = prescriptionForm.watch("index");

  const columns: ColumnDefWithClass<prescribedDrugType>[] = [
    {
      accessorKey: "name",
      header: "Name",
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "frequency",
      header: "Frequency",
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "days",
      header: "Days",
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      id: "actions",
      header: () => <p>Action</p>,
      cell: ({ row }) => (
        <Actions
          data={row.original}
          form={prescriptionForm}
          index={row.index}
          remove={remove}
        />
      ),
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    },
  ];

  const handleAddUpdate = () => {
    prescriptionForm.handleSubmit(() => {
      const values = prescriptionForm.getValues();

      if (typeof values.index === "number") {
        update(values.index as number, {
          ...values,
        });
      } else {
        append({
          ...values,
        });
      }
      prescriptionForm.reset({});
    })();
  };

  return (
    <CustomLayout title="Prescription">
      <div className="py-2 grid grid-cols-4 space-x-2">
        <FormField
          control={prescriptionForm.control}
          label="Name"
          name="name"
          type="text"
          required
        />
        <FormField
          control={prescriptionForm.control}
          label="Frequency"
          name="frequency"
          type="number"
          required
        />
        <FormField
          control={prescriptionForm.control}
          label="Days"
          name="days"
          type="number"
          required
        />
        <FormField
          control={prescriptionForm.control}
          label="Remarks"
          name="remarks"
          type="text"
        />
        <div className="col-span-4 space-x-2">
          <div className="w-full flex justify-end">
            <CustomButton
              type="button"
              onClick={handleAddUpdate}
              className="self-end"
            >
              {typeof editingIndex === "number" ? "Update" : "Add"}
            </CustomButton>
          </div>
        </div>
      </div>
      <div>
        <CustomTable
          data={addedDrugs || []}
          columns={columns}
          getRowId={(row) => row.index as string}
        />
      </div>
      <FormField
        control={form.control}
        label="Other Advice"
        name="prescription.otherAdvice"
        type="text"
      />
      <div className="grid grid-cols-[45%_10%_45%]">
        <FormField
          control={form.control}
          label="Follow Up After (days)"
          name="prescription.followUpAfterDays"
          type="number"
        />
        <p className="text-blue-300 font-semibold text-center">OR</p>
        <FormField
          control={form.control}
          label="Follow Up On Date"
          name="prescription.followUpDate"
          type="date"
        />
      </div>
      <FormField
        control={form.control}
        label="Follow Up Advice"
        name="prescription.followUpAdvice"
        type="textarea"
      />
    </CustomLayout>
  );
};

const Advice = ({
  form,
  data,
}: {
  data?: consultantFileType;
  form: UseFormReturn<consultantFileType>;
}) => {
  const [pathologySearchValue, setPathologySearchValue] = useState("");
  const [radiologySearchValue, setRadiologySearchValue] = useState("");

  const pathologyTests = useInfinitePathologyTestsList(
    {
      name: pathologySearchValue,
      defaultSelectedIds: (data?.advisedPathologyTests as string[]) || [],
    },
    10,
  );
  const radiologyTests = useInfiniteRadiologyTestsList(
    {
      name: radiologySearchValue,
      defaultSelectedIds: (data?.advisedRadiologyTests as string[]) || [],
    },
    10,
  );

  return (
    <CustomLayout title="Advice">
      <div className="grid grid-cols-2 space-x-2">
        <FormField
          control={form.control}
          label="Diagnosis"
          name="diagnosis"
          type="text"
        />
        <FormField
          control={form.control}
          label="Chronic Illness"
          name="chronicIllness"
          type="text"
        />

        <FormInfiniteSelect<
          PathologyTestDataType,
          PaginatedResponse<PathologyTestDataType>,
          string,
          consultantFileType
        >
          name="advisedPathologyTests"
          label="Pathology"
          control={form.control}
          query={pathologyTests}
          getItems={(d) => d?.data}
          labelKey={(i) => i.name}
          valueKey={(i) => String(i?.id)}
          search={pathologySearchValue}
          onSearchChange={setPathologySearchValue}
          multiple
        />
        <FormInfiniteSelect<
          RadiologyTest,
          PaginatedResponse<RadiologyTest>,
          string,
          consultantFileType
        >
          name="advisedRadiologyTests"
          label="Radiology"
          control={form.control}
          query={radiologyTests}
          getItems={(d) => d?.data}
          labelKey={(i) => i.name}
          valueKey={(i) => String(i?.id)}
          search={radiologySearchValue}
          onSearchChange={setRadiologySearchValue}
          multiple
        />
      </div>
    </CustomLayout>
  );
};

const VitalsComplaintAndHistoryNotes = ({
  form,
}: {
  form: UseFormReturn<consultantFileType>;
}) => {
  return (
    <div className="grid grid-cols-2 space-y-2">
      <CustomLayout
        title="Vital Parameters"
        contentClassName="grid grid-cols-2 space-x-2"
      >
        <FormField
          control={form.control}
          label="Height (cm)"
          name="vitals.height"
          type="number"
        />
        <FormField
          control={form.control}
          label="Weight (kg)"
          name="vitals.weight"
          type="number"
        />
        <FormField
          control={form.control}
          label="bp (mm)"
          name="vitals.bpMm"
          type="number"
        />
        <FormField
          control={form.control}
          label="bp (Hg)"
          name="vitals.bpHg"
          type="number"
        />
        <FormField
          control={form.control}
          label="Pulse (/min)"
          name="vitals.pulse"
          type="number"
        />
        <FormField
          control={form.control}
          label="RBS (mg/dL)"
          name="vitals.rbs"
          type="number"
        />
        <FormField
          control={form.control}
          label="RBS (/min)"
          name="vitals.rr"
          type="number"
        />
        <FormField
          control={form.control}
          label="SpO2 (%)"
          name="vitals.spo2"
          type="number"
        />
        <FormField
          control={form.control}
          label="Temp (F)"
          name="vitals.temp"
          type="number"
        />
      </CustomLayout>
      <CustomLayout title="Complaints and History/Notes">
        <FormField control={form.control} name="notes" type="richText" />
      </CustomLayout>
      <div className="col-span-2">
        <FormField
          control={form.control}
          name="generalExaminations"
          label="General Examinations"
          type="text"
        />
        <FormField
          control={form.control}
          name="systemicExaminations"
          label="Systemic Examinations"
          type="text"
        />
      </div>
    </div>
  );
};

const ConsultationForm = ({ data }: { data?: consultantFileType }) => {
  const params: { opdId: string } = useParams();
  const { mutateAsync, isPending } = useUpdateOpdConsultation();

  const form = useForm<consultantFileType>({
    defaultValues: data || {
      opdId: Number(params.opdId),
      prescription: { opdId: Number(params.opdId) },
      vitals: { opdId: Number(params.opdId) },
    },
    resolver: zodResolver(consultationFileValidator),
  });

  const onSubmit = (values: consultantFileType) => {
    mutateAsync(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <VitalsComplaintAndHistoryNotes form={form} />
        <Advice form={form} data={data} />
        <Prescription form={form} />
        <CustomButton disabled={isPending} type="submit">
          Save
        </CustomButton>
      </form>
    </Form>
  );
};

const OpdConsultationForm = () => {
  const { opdId }: { opdId?: string } = useParams();

  const { data, isLoading: fetchingFile } = useGetConsultationFile(opdId);

  if (fetchingFile) {
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

  if (opdId && !data) {
    return <div />;
  }

  return opdId && data ? (
    <ConsultationForm data={data} />
  ) : (
    <ConsultationForm />
  );
};

export default OpdConsultationForm;
