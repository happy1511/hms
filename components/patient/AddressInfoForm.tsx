import { ColumnDefWithClass, PaginatedResponse } from "@/lib/type";
import {
  patientAddress,
  PatientAddressValidatorType,
  PatientValidatorType,
} from "@/validators/api/masters/patient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import {
  useFieldArray,
  useForm,
  UseFormReturn,
  useWatch,
} from "react-hook-form";
import { SortableHeader } from "../common/SortableHeader";
import { CustomAlert } from "../common/CustomAlert";
import { Button } from "../ui/button";
import { Edit2, Trash2 } from "lucide-react";
import FormField from "../form-inputs/FormField";
import CustomButton from "../common/CustomButton";
import { CustomTable } from "../common/CustomTable";
import { useInfiniteLocationsList } from "@/hooks/query/locations";
import { FormInfiniteSelect } from "../form-inputs/FormInfiniteSelect";
import { AddressType } from "@/generated/prisma/enums";
import { Location } from "@/generated/prisma/client";
import { randomUUID } from "crypto";

const AddressInfoFormForm = ({
  form,
  goNext,
}: {
  form: UseFormReturn<PatientValidatorType>;
  goNext: () => void;
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [locationSearch, setLocationSearch] = useState("");
  const locationQuery = useInfiniteLocationsList({ name: locationSearch }, 10);

  const { append, remove, update } = useFieldArray({
    control: form.control,
    name: "addresses",
  });

  const values = useWatch({
    name: "addresses",
  });

  const addressForm = useForm<PatientAddressValidatorType>({
    resolver: zodResolver(patientAddress),
    defaultValues: {
      type: AddressType["HOME"],
    },
  });

  const handleSubmit = (values: PatientAddressValidatorType) => {
    if (editingIndex === null) {
      append(values);
    } else {
      update(editingIndex, values);
      setEditingIndex(null);
    }

    addressForm.reset({});
  };

  const submit = addressForm.handleSubmit(handleSubmit);

  const columns: ColumnDefWithClass<PatientAddressValidatorType>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <SortableHeader<PatientAddressValidatorType>
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
          <SortableHeader<PatientAddressValidatorType>
            label="User Name"
            column={column}
          />
        );
      },

      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "addressLineOne",
      header: ({ column }) => {
        return (
          <SortableHeader<PatientAddressValidatorType>
            label="Address Line 1"
            column={column}
          />
        );
      },

      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "addressLineTwo",
      header: ({ column }) => {
        return (
          <SortableHeader<PatientAddressValidatorType>
            label="Address Line 2"
            column={column}
          />
        );
      },

      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "addressLineThree",
      header: ({ column }) => {
        return (
          <SortableHeader<PatientAddressValidatorType>
            label="Address Line 3"
            column={column}
          />
        );
      },

      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "city",
      header: ({ column }) => {
        return (
          <SortableHeader<PatientAddressValidatorType>
            label="City"
            column={column}
          />
        );
      },

      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "state",
      header: ({ column }) => {
        return (
          <SortableHeader<PatientAddressValidatorType>
            label="State"
            column={column}
          />
        );
      },

      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "country",
      header: ({ column }) => {
        return (
          <SortableHeader<PatientAddressValidatorType>
            label="Country"
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
              addressForm.reset(row.original);
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
          control={addressForm.control}
          label="Address Type"
          name="type"
          type="select"
          options={Object.values(AddressType).flatMap((a) => ({
            label: a,
            value: a,
          }))}
        />
        <FormField
          control={addressForm.control}
          label="Address Line 1"
          name="addressLineOne"
          type="text"
        />
        <FormField
          control={addressForm.control}
          label="Address Line 2"
          name="addressLineTwo"
          type="text"
        />
        <FormField
          control={addressForm.control}
          label="Address Line 3"
          name="addressLineThree"
          type="text"
        />
        <FormInfiniteSelect<
          Location,
          PaginatedResponse<Location>,
          string,
          PatientAddressValidatorType
        >
          control={addressForm.control}
          label="City"
          name="locationId"
          query={locationQuery}
          getItems={(p) => p?.data}
          valueKey={(i) => String(i?.id)}
          labelKey={(i) => i?.city}
          placeholder="City"
          search={locationSearch}
          onSearchChange={setLocationSearch}
        />
        <FormInfiniteSelect<
          Location,
          PaginatedResponse<Location>,
          string,
          PatientAddressValidatorType
        >
          control={addressForm.control}
          label="State"
          name="locationId"
          query={locationQuery}
          getItems={(p) => p?.data}
          valueKey={(i) => String(i?.id)}
          labelKey={(i) => i?.state}
          placeholder="State"
          search={locationSearch}
          onSearchChange={setLocationSearch}
        />
        <FormInfiniteSelect<
          Location,
          PaginatedResponse<Location>,
          string,
          PatientAddressValidatorType
        >
          control={addressForm.control}
          label="Country"
          name="locationId"
          query={locationQuery}
          getItems={(p) => p?.data}
          valueKey={(i) => String(i?.id)}
          labelKey={(i) => i?.country}
          placeholder="Country"
          search={locationSearch}
          onSearchChange={setLocationSearch}
        />
        <FormInfiniteSelect<
          Location,
          PaginatedResponse<Location>,
          string,
          PatientAddressValidatorType
        >
          control={addressForm.control}
          label="Post Code"
          name="locationId"
          query={locationQuery}
          getItems={(p) => p?.data}
          valueKey={(i) => String(i?.id)}
          labelKey={(i) => i?.postcode}
          placeholder="Country"
          search={locationSearch}
          onSearchChange={setLocationSearch}
        />
        <div className="flex justify-start">
          <CustomButton type="button" onClick={submit}>
            {editingIndex !== null ? "Save" : "Add"}
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

export default AddressInfoFormForm;
