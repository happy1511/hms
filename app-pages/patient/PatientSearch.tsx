"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import { SortableHeader } from "@/components/common/SortableHeader";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import { Patient } from "@/generated/prisma/client";
import { useProfile } from "@/hooks/query/auth";
import { usePatientsList } from "@/hooks/query/patient";
import { ColumnDefWithClass, FilterValues } from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import {
  findPatientValidator,
  FindPatientValidatorType,
} from "@/validators/api/masters/patient";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

const Actions = ({
  data,
  createOpd,
}: {
  data: Patient;
  createOpd: boolean;
}) => {
  return (
    <>
      {createOpd && (
        <Link
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-tiny rounded-md text-sm font-medium transition-all disabled:pointer-events-none outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 has-[>svg]:px-3 h-auto shadow-none p-1 cursor-pointer"
          href={`/opd/bill/${data.id}`}
        >
          Select
        </Link>
      )}
    </>
  );
};

const PatientSearch = () => {
  const [filters, setFilters] = useState<FilterValues>({});
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const query = useSearchParams();
  const opdCreate = query.get("opdCreate");
  const router = useRouter();

  const { data: profile } = useProfile(false);
  const { data, isLoading, isError, error } = usePatientsList(
    filters,
    page,
    limit,
  );

  const form = useForm<FindPatientValidatorType>({
    resolver: zodResolver(findPatientValidator),
  });

  const handleSubmit = (values: FindPatientValidatorType) => {
    setFilters(values);
  };

  if (!profile) {
    return <></>;
  }

  const canView = hasActionPermission(
    profile?.data,
    ModuleType.PATIENT_MASTER,
    ActionType.VIEW,
  );

  const canCreateOPD = hasActionPermission(
    profile?.data,
    ModuleType.OPD_BILL,
    ActionType.CREATE,
  );

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

  if (canCreateOPD && opdCreate) {
    columns.push({
      accessorKey: "actions",
      header: ({ column }) => {
        return <SortableHeader<Patient> label="Actions" column={column} />;
      },
      cell: ({ row }) => (
        <Actions data={row.original} createOpd={Boolean(canCreateOPD)} />
      ),
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    });
  }

  if (!canView || !canCreateOPD) {
    return <></>;
  }

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
