import CustomButton from "../common/CustomButton";
import { CustomTable } from "../common/CustomTable";
import { SortableHeader } from "../common/SortableHeader";
import {
  notes,
  PatientNotesValidatorType,
  PatientValidatorType,
} from "@/validators/api/masters/patient";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useFieldArray,
  useForm,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import { ColumnDefWithClass } from "@/lib/type";
import FormField from "../form-inputs/FormField";
import { useState } from "react";
import { CustomAlert } from "../common/CustomAlert";
import { Button } from "../ui/button";
import { Edit2, Trash2 } from "lucide-react";

const NotesInfoForm = ({
  form,
  goNext,
}: {
  form: UseFormReturn<PatientValidatorType>;
  goNext: () => void;
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { append, remove, update } = useFieldArray({
    control: form.control,
    name: "notes",
  });

  const values = useWatch({
    name: "notes",
  });

  const notesForm = useForm<PatientNotesValidatorType>({
    resolver: zodResolver(notes),
  });

  const handleSubmit = (values: PatientNotesValidatorType) => {
    if (editingIndex === null) {
      append(values);
    } else {
      update(editingIndex, values);
      setEditingIndex(null);
    }

    notesForm.reset({});
  };

  const submit = notesForm.handleSubmit(handleSubmit);

  const columns: ColumnDefWithClass<PatientNotesValidatorType>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <SortableHeader<PatientNotesValidatorType>
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
          <SortableHeader<PatientNotesValidatorType>
            label="Type"
            column={column}
          />
        );
      },

      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "note",
      header: ({ column }) => {
        return (
          <SortableHeader<PatientNotesValidatorType>
            label="Note"
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
              notesForm.reset(row.original);
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
          control={notesForm.control}
          label="Type"
          name="type"
          type="text"
        />
        <FormField
          control={notesForm.control}
          label="Note"
          name="note"
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
        handleChangeLimit={() => {}}
      />
    </div>
  );
};

export default NotesInfoForm;
