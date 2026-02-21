import { ColumnDefWithClass } from "@/lib/type";
import {
  emergencyContact,
  PatientEmergencyContactValidatorType,
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
import CustomButton from "../common/CustomButton";
import { CustomTable } from "../common/CustomTable";
import { useState } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { CustomAlert } from "../common/CustomAlert";
import { randomUUID } from "crypto";

const EmergencyContactInfoForm = ({
  form,
  goNext,
}: {
  form: UseFormReturn<PatientValidatorType>;
  goNext: () => void;
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { append, remove, update } = useFieldArray({
    control: form.control,
    name: "emergencyContacts",
  });

  const values = useWatch({
    name: "emergencyContacts",
  });

  const emergencyContactForm = useForm<PatientEmergencyContactValidatorType>({
    resolver: zodResolver(emergencyContact),
  });

  const handleSubmit = (values: PatientEmergencyContactValidatorType) => {
    if (editingIndex === null) {
      append(values);
    } else {
      update(editingIndex, values);
      setEditingIndex(null);
    }

    emergencyContactForm.reset({});
  };

  const submit = emergencyContactForm.handleSubmit(handleSubmit);

  const columns: ColumnDefWithClass<PatientEmergencyContactValidatorType>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <SortableHeader<PatientEmergencyContactValidatorType>
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
      accessorKey: "relation",
      header: ({ column }) => {
        return (
          <SortableHeader<PatientEmergencyContactValidatorType>
            label="Relation"
            column={column}
          />
        );
      },

      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <SortableHeader<PatientEmergencyContactValidatorType>
            label="Name"
            column={column}
          />
        );
      },

      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "contact",
      header: ({ column }) => {
        return (
          <SortableHeader<PatientEmergencyContactValidatorType>
            label="Contact"
            column={column}
          />
        );
      },

      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <SortableHeader<PatientEmergencyContactValidatorType>
            label="Email"
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
              emergencyContactForm.reset(row.original);
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
          control={emergencyContactForm.control}
          label="Relation"
          name="relation"
          type="text"
        />
        <FormField
          control={emergencyContactForm.control}
          label="Name"
          name="name"
          type="text"
        />
        <FormField
          control={emergencyContactForm.control}
          label="Contact"
          name="contact"
          type="text"
        />
        <FormField
          control={emergencyContactForm.control}
          label="Email"
          name="email"
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

export default EmergencyContactInfoForm;
