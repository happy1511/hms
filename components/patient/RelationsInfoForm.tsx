import { CustomTable } from "../common/CustomTable";
import CustomButton from "../common/CustomButton";
import FormField from "../form-inputs/FormField";
import { SortableHeader } from "../common/SortableHeader";
import {
  PatientRelationsValidatorType,
  PatientValidatorType,
  relations,
} from "@/validators/api/masters/patient";
import {
  useFieldArray,
  useForm,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ColumnDefWithClass } from "@/lib/type";
import { useState } from "react";
import { CustomAlert } from "../common/CustomAlert";
import { Button } from "../ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { randomUUID } from "crypto";

const RelationsInfoForm = ({
  form,
  goNext,
}: {
  form: UseFormReturn<PatientValidatorType>;
  goNext: () => void;
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { append, remove, update } = useFieldArray({
    control: form.control,
    name: "relations",
  });

  const values = useWatch({
    name: "relations",
  });

  const relationsForm = useForm<PatientRelationsValidatorType>({
    resolver: zodResolver(relations),
  });

  const handleSubmit = (values: PatientRelationsValidatorType) => {
    if (editingIndex === null) {
      append(values);
    } else {
      update(editingIndex, values);
      setEditingIndex(null);
    }

    relationsForm.reset({});
  };

  const submit = relationsForm.handleSubmit(handleSubmit);

  const columns: ColumnDefWithClass<PatientRelationsValidatorType>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <SortableHeader<PatientRelationsValidatorType>
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
          <SortableHeader<PatientRelationsValidatorType>
            label="Type"
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
          <SortableHeader<PatientRelationsValidatorType>
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
          <SortableHeader<PatientRelationsValidatorType>
            label="Contact"
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
            title="Delete Relative?"
            description="Are you sure you want to delete relative?"
            cancelText="Cancel"
            confirmText="Delete"
            handleConfirm={() => remove(0)}
          />

          <Button
            variant="outline"
            className="h-auto shadow-none p-1 cursor-pointer"
            onClick={() => {
              setEditingIndex(row.index);
              relationsForm.reset(row.original);
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
          control={relationsForm.control}
          label="Relation"
          name="type"
          type="text"
          required
        />
        <FormField
          control={relationsForm.control}
          label="Name"
          name="name"
          type="text"
          required
        />
        <FormField
          control={relationsForm.control}
          label="Contact"
          name="contact"
          type="text"
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
export default RelationsInfoForm;
