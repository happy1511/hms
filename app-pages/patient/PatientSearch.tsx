"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import { SortableHeader } from "@/components/common/SortableHeader";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import { Patient } from "@/generated/prisma/client";
import { usePatientsList } from "@/hooks/query/patient";
import { ColumnDefWithClass, FilterValues } from "@/lib/type";
import {
  findPatientValidator,
  FindPatientValidatorType,
} from "@/validators/api/masters/patient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

const columns: ColumnDefWithClass<Patient>[] = [
  {
    accessorKey: "_id",
    header: ({ column }) => {
      return <SortableHeader<Patient> label="ID" column={column} />;
    },
    cell: ({ row }) => <span>#{row.index + 1}</span>,
    headerClassName: "min-w-15 max-w-20",
    cellClassName: "min-w-15 max-w-20",
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return <SortableHeader<Patient> label="Name" column={column} />;
    },
    headerClassName: "min-w-50",
    cellClassName: "min-w-50",
    cell: ({ row }) => (
      <span>
        {row.original.firstName} {row.original.lastName}
      </span>
    ),
  },

  {
    accessorKey: "uhid",
    header: ({ column }) => {
      return <SortableHeader<Patient> label="UHID No" column={column} />;
    },
    headerClassName: "min-w-50",
    cellClassName: "min-w-50",
  },
];

const PatientSearch = () => {
  const [filters, setFilters] = useState<FilterValues>({});
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = usePatientsList(
    filters,
    page,
    limit,
  );
  const router = useRouter();

  const form = useForm<FindPatientValidatorType>({
    resolver: zodResolver(findPatientValidator),
  });

  const handleSubmit = (values: FindPatientValidatorType) => {
    setFilters(values);
  };

  return (
    <CustomLayout title="Patient Search">
      <div className="grid grid-cols-10 space-y-2">
        <Form {...form}>
          <form
            className="col-span-3"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            <FormField
              label="Name"
              type="text"
              control={form.control}
              name="name"
            />
            <FormField
              label="UHID No"
              type="text"
              control={form.control}
              name="uhid"
            />
            <FormField
              label="Contact No"
              type="text"
              control={form.control}
              name="contactNo"
            />
            <div className="flex gap-2">
              <CustomButton onClick={() => router.push("/patient/new")}>
                Register New Patient
              </CustomButton>
              <CustomButton type="submit">Search</CustomButton>
            </div>
          </form>
        </Form>
        <div className="col-span-12">
          <CustomTable
            columns={columns}
            data={data?.data || []}
            page={page}
            total={data?.total}
            enableSorting
            handleChangePage={setPage}
            isLoading={isLoading}
            limit={limit}
            handleChangeLimit={setLimit}
            isError={isError}
            error={error}
          />
        </div>
      </div>
    </CustomLayout>
  );
};

export default PatientSearch;
