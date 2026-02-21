import { ColumnDefWithClass } from "@/lib/type";
import {
  patientContact,
  PatientContactValidatorType,
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
import { ContactType } from "@/generated/prisma/enums";
import CustomButton from "../common/CustomButton";
import { CustomTable } from "../common/CustomTable";
import { CustomAlert } from "../common/CustomAlert";
import { Button } from "../ui/button";
import { useState } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { randomUUID } from "crypto";

const ContactInfoForm = ({
  form,
  goNext,
}: {
  form: UseFormReturn<PatientValidatorType>;
  goNext: () => void;
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { append, remove, update } = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  const values = useWatch({
    name: "contacts",
  });

  const contactForm = useForm<PatientContactValidatorType>({
    resolver: zodResolver(patientContact),
  });

  const handleSubmit = (values: PatientContactValidatorType) => {
    if (editingIndex === null) {
      append(values);
    } else {
      update(editingIndex, values);
      setEditingIndex(null);
    }

    contactForm.reset({});
  };

  const submit = contactForm.handleSubmit(handleSubmit);

  const columns: ColumnDefWithClass<PatientContactValidatorType>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <SortableHeader<PatientContactValidatorType>
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
          <SortableHeader<PatientContactValidatorType>
            label="Type"
            column={column}
          />
        );
      },

      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "value",
      header: ({ column }) => {
        return (
          <SortableHeader<PatientContactValidatorType>
            label="Value"
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
              contactForm.reset(row.original);
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

  return (
    <div className="col-span-2 grid grid-cols-1 gap-2">
      <div className="grid grid-cols-2 space-x-2">
        <FormField
          control={contactForm.control}
          label="Contact Type"
          name="type"
          type="select"
          options={Object.values(ContactType).flatMap((a) => ({
            label: a,
            value: a,
          }))}
        />
        <FormField
          control={contactForm.control}
          label="Value"
          name="value"
          type="text"
        />

        <div className="flex justify-start">
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

export default ContactInfoForm;
