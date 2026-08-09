"use client";

import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import NoPermission from "@/components/common/NoPermission";
import { SortableHeader } from "@/components/common/SortableHeader";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import SelectDischargedIpdModal from "@/components/pharmacy/SelectDischargedIpdModal";
import { Form } from "@/components/ui/form";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import {
  useInfinitePharmacyIpdPatients,
  useIpdBillRows,
} from "@/hooks/query/pharmacyIpdBill";
import {
  ColumnDefWithClass,
  FilterValues,
  IPDType,
  PaginatedResponse,
  PharmacyIpdBillRowType,
} from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { format } from "date-fns";
import { useState } from "react";
import { useForm } from "react-hook-form";

const PHARMACY_IPD_BILL_MODULE = "PHARMACY_IPD_BILL" as ModuleType;

type SelectorValues = {
  ipd?: IPDType | null;
};

const patientLabel = (ipd?: IPDType | null) =>
  ipd
    ? [
        `IPD ${ipd.id}`,
        [ipd.patient.firstName, ipd.patient.middleName, ipd.patient.lastName]
          .filter(Boolean)
          .join(" "),
        format(new Date(ipd.ipdDateTime), "dd/MM/yyyy"),
        ipd.isDischarged ? "Discharged" : "Current",
      ].join(" | ")
    : "";

const IpdBills = () => {
  const { data: profile } = useProfile(false);
  const [ipdSearch, setIpdSearch] = useState("");
  const currentIpdQuery = useInfinitePharmacyIpdPatients(
    { isDischarged: false, isDayCare: false, name: ipdSearch } as FilterValues,
    20,
  );
  const form = useForm<SelectorValues>({
    defaultValues: { ipd: null },
  });

  const selectedIpd = form.watch("ipd");
  const { data, isLoading, isError, error } = useIpdBillRows(selectedIpd?.id);

  if (!profile) return <div />;

  const canView = hasActionPermission(
    profile.data,
    PHARMACY_IPD_BILL_MODULE,
    ActionType.VIEW,
  );

  if (!canView) {
    return (
      <CustomLayout title="IPD Bills">
        <NoPermission />
      </CustomLayout>
    );
  }

  const columns: ColumnDefWithClass<PharmacyIpdBillRowType>[] = [
    {
      accessorKey: "order",
      header: ({ column }) => (
        <SortableHeader<PharmacyIpdBillRowType> label="Order" column={column} />
      ),
      cell: ({ row }) => row.original.order,
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "batch",
      header: ({ column }) => (
        <SortableHeader<PharmacyIpdBillRowType> label="Batch" column={column} />
      ),
      cell: ({ row }) => row.original.batch,
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "patient",
      header: ({ column }) => (
        <SortableHeader<PharmacyIpdBillRowType> label="Patient" column={column} />
      ),
      cell: ({ row }) => row.original.patient,
      headerClassName: "min-w-48",
      cellClassName: "min-w-48",
    },
    {
      accessorKey: "ipdNo",
      header: ({ column }) => (
        <SortableHeader<PharmacyIpdBillRowType> label="IPD No." column={column} />
      ),
      cell: ({ row }) => row.original.ipdNo,
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "submission",
      header: ({ column }) => (
        <SortableHeader<PharmacyIpdBillRowType> label="Submission" column={column} />
      ),
      cell: ({ row }) => format(new Date(row.original.submission), "dd/MM/yyyy"),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      accessorKey: "item",
      header: ({ column }) => (
        <SortableHeader<PharmacyIpdBillRowType> label="Item" column={column} />
      ),
      cell: ({ row }) => row.original.item,
      headerClassName: "min-w-48",
      cellClassName: "min-w-48",
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <SortableHeader<PharmacyIpdBillRowType> label="Qty" column={column} />
      ),
      cell: ({ row }) => row.original.quantity,
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
  ];

  return (
    <CustomLayout title="IPD Bills">
      <div className="space-y-4">
        <Form {...form}>
          <form className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <FormInfiniteSelect<
              IPDType,
              PaginatedResponse<IPDType>,
              string,
              SelectorValues
            >
              label="IPD Patient"
              control={form.control}
              name="ipd"
              query={currentIpdQuery}
              getItems={(page) => page?.data}
              valueKey={(row) => String(row.id)}
              labelKey={(row) => patientLabel(row)}
              searchValue={ipdSearch}
              onSearchChange={setIpdSearch}
            />
            <div className="flex items-end">
              <SelectDischargedIpdModal
                onSelect={(ipd) => form.setValue("ipd", ipd, { shouldDirty: true })}
              />
            </div>
          </form>
        </Form>

        {selectedIpd?.id ? (
          <CustomTable
            columns={columns}
            data={data || []}
            isLoading={isLoading}
            isError={isError}
            error={error}
            getRowId={(row) => row.id}
          />
        ) : (
          <div className="rounded-md border border-dashed px-4 py-6 text-sm text-muted-foreground">
            Select a current or discharged IPD patient to see the issued pharmacy rows.
          </div>
        )}
      </div>
    </CustomLayout>
  );
};

export default IpdBills;
