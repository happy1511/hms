import { ColumnDefWithClass } from "@/lib/type";
import {
  identifications,
  PatientIdentificationValidatorType,
  PatientValidatorType,
} from "@/validators/api/masters/patient";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useFieldArray,
  useForm,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import { SortableHeader } from "../common/SortableHeader";
import FormField from "../form-inputs/FormField";
import { IdentityType, Status } from "@/generated/prisma/enums";
import CustomButton from "../common/CustomButton";
import { CustomTable } from "../common/CustomTable";
import { useState } from "react";
import { CustomAlert } from "../common/CustomAlert";
import { Button } from "../ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { randomUUID } from "crypto";

const IdentificationInfoForm = ({
  form,
  goNext,
}: {
  form: UseFormReturn<PatientValidatorType>;
  goNext: () => void;
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { append, remove, update } = useFieldArray({
    control: form.control,
    name: "identifications",
  });

  const values = useWatch({
    name: "identifications",
  });

  const identificationForm = useForm<PatientIdentificationValidatorType>({
    resolver: zodResolver(identifications),
  });

  const handleSubmit = (values: PatientIdentificationValidatorType) => {
    console.log("object", editingIndex);
    if (editingIndex === null) {
      append(values);
    } else {
      update(editingIndex, values);
      setEditingIndex(null);
    }

    identificationForm.reset({});
  };
  const submit = identificationForm.handleSubmit(handleSubmit);

  const columns: ColumnDefWithClass<PatientIdentificationValidatorType>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <SortableHeader<PatientIdentificationValidatorType>
            label="ID"
            column={column}
          />
        );
      },
      cell: ({ row }) => <span>#{row.index + 1}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "type",
      header: ({ column }) => {
        return (
          <SortableHeader<PatientIdentificationValidatorType>
            label="Type"
            column={column}
          />
        );
      },

      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "number",
      header: ({ column }) => {
        return (
          <SortableHeader<PatientIdentificationValidatorType>
            label="Number"
            column={column}
          />
        );
      },

      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      id: "actions",
      header: () => <p>Action</p>,
      cell: ({ row }) => (
        <>
          <CustomAlert
            triggerButton={
              <Button
                variant="outline"
                className="h-auto shadow-none p-1 cursor-pointer"
              >
                <Trash2 className="size-2.5 text-destructive" />
              </Button>
            }
            title="Delete Address?"
            description="Are you sure you want to delete Address?"
            cancelText="Cancel"
            confirmText="Delete"
            handleConfirm={() => remove(0)}
          />

          <Button
            variant="outline"
            className="h-auto shadow-none p-1 cursor-pointer"
            onClick={() => {
              setEditingIndex(row.index);
              identificationForm.reset(row.original);
            }}
          >
            <Edit2 className="size-2.5" />
          </Button>
        </>
      ),
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    },
  ];

  console.log(
    identificationForm.formState.errors,
    identificationForm.getValues(),
  );

  return (
    <div className="col-span-2 grid grid-cols-1 gap-2">
      <div className="grid grid-cols-2 space-x-2">
        <FormField
          control={identificationForm.control}
          label="Type"
          name="type"
          type="select"
          options={Object.values(IdentityType).flatMap((a) => ({
            label: a,
            value: a,
          }))}
        />
        <FormField
          control={identificationForm.control}
          label="Number"
          name="number"
          type="text"
        />

        <FormField
          control={identificationForm.control}
          label="Status"
          name="active"
          type="select"
          options={Object.values(Status).map((s) => ({ value: s, label: s }))}
        />

        <div className="flex col-span-2 justify-start">
          <CustomButton type="button" onClick={submit}>
            Add
          </CustomButton>
        </div>
      </div>
      <CustomTable
        columns={columns}
        data={values || []}
        page={1}
        total={values.length}
        enableSorting
        handleChangePage={() => {}}
        handleChangeLimit={() => {}}
        getRowId={() => randomUUID()}
      />
      <div className="flex justify-start">
        <CustomButton type="button" onClick={goNext}>
          Next
        </CustomButton>
      </div>
    </div>
  );
};

export default IdentificationInfoForm;
