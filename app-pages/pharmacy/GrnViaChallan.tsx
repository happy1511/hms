"use client";

import CustomButton from "@/components/common/CustomButton";
import { CustomTable } from "@/components/common/CustomTable";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import { SortableHeader } from "@/components/common/SortableHeader";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import { Form } from "@/components/ui/form";
import { DrugSupplier } from "@/generated/prisma/client";
import { ActionType, ModuleType, Status } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useInfiniteDrugSupplierList } from "@/hooks/query/drugSupplier";
import { useChallanList } from "@/hooks/query/pharmacyChallan";
import {
  ColumnDefWithClass,
  PaginatedResponse,
  PharmacyChallanType,
} from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";

const selectorValidator = z.object({
  supplier: z
    .object({ id: z.number(), name: z.string().optional() })
    .optional(),
});

type SelectorValues = z.infer<typeof selectorValidator>;

const money = (value: number) => Number(value || 0).toFixed(2);

const GrnViaChallan = () => {
  const router = useRouter();
  const { data: profile } = useProfile(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [supplierSearch, setSupplierSearch] = useState("");
  const supplierQuery = useInfiniteDrugSupplierList(
    { name: supplierSearch, status: Status.active },
    10,
  );
  const form = useForm<SelectorValues>({
    defaultValues: { supplier: undefined },
    resolver: zodResolver(selectorValidator),
  });

  const selectedSupplier = form.watch("supplier");
  const {
    data: challans,
    isLoading,
    isError,
    error,
  } = useChallanList(
    {
      supplierId: selectedSupplier?.id,
      withoutGrn: true,
    },
    page,
    limit,
  );

  const columns: ColumnDefWithClass<PharmacyChallanType>[] = [
    {
      id: "srNo",
      header: () => <button className="flex">SRNo</button>,
      cell: ({ row }) => (page - 1) * limit + row.index + 1,
      headerClassName: "min-w-16",
      cellClassName: "min-w-16",
    },
    {
      accessorKey: "id",
      header: ({ column }) => (
        <SortableHeader<PharmacyChallanType> label="ID" column={column} />
      ),
      cell: ({ row }) => row.original.id,
      headerClassName: "min-w-16",
      cellClassName: "min-w-16",
    },
    {
      accessorKey: "supplier.name",
      header: ({ column }) => (
        <SortableHeader<PharmacyChallanType> label="Supplier" column={column} />
      ),
      cell: ({ row }) => row.original.supplier.name || "-",
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "challanNumber",
      header: ({ column }) => (
        <SortableHeader<PharmacyChallanType>
          label="Challan No."
          column={column}
        />
      ),
      cell: ({ row }) => row.original.challanNumber,
      headerClassName: "min-w-28",
      cellClassName: "min-w-28",
    },
    {
      accessorKey: "invoiceDate",
      header: ({ column }) => (
        <SortableHeader<PharmacyChallanType>
          label="Invoice Date"
          column={column}
        />
      ),
      cell: ({ row }) => format(row.original.invoiceDate, "MMM dd, yyyy"),
      headerClassName: "min-w-28",
      cellClassName: "min-w-28",
    },
    {
      id: "itemsCount",
      header: ({ column }) => (
        <SortableHeader<PharmacyChallanType>
          label="Items(Count)"
          column={column}
        />
      ),
      cell: ({ row }) => row.original.items.length,
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      id: "amount",
      header: ({ column }) => (
        <SortableHeader<PharmacyChallanType> label="Amount" column={column} />
      ),
      cell: ({ row }) => money(Number(row.original.grandTotal || 0)),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      id: "actions",
      header: () => <button className="flex">Actions</button>,
      cell: ({ row }) => (
        <CustomButton
          onClick={() => router.push(`/pharmacy/form/grn/challan/${row.original.id}`)}
        >
          Select
        </CustomButton>
      ),
      headerClassName: "min-w-28",
      cellClassName: "min-w-28",
    },
  ];

  if (!profile) {
    return <div />;
  }

  const canCreate = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_GRN,
    ActionType.CREATE,
  );

  if (!canCreate) {
    return (
      <CustomLayout title="Create GRN via Challan">
        <NoPermission />
      </CustomLayout>
    );
  }

  return (
    <CustomLayout title="Create GRN via Challan">
      <div className="space-y-4">
        <Form {...form}>
          <form className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <FormInfiniteSelect<
              DrugSupplier,
              PaginatedResponse<DrugSupplier>,
              string,
              SelectorValues
            >
              label="Supplier"
              control={form.control}
              name="supplier"
              query={supplierQuery}
              getItems={(page) => page?.data}
              valueKey={(item) => String(item.id)}
              labelKey={(item) => item.name}
              search={supplierSearch}
              onSearchChange={setSupplierSearch}
              required
            />
          </form>
        </Form>

        {selectedSupplier?.id ? (
          <CustomTable
            columns={columns}
            data={challans?.data || []}
            page={page}
            total={challans?.total}
            limit={limit}
            handleChangePage={setPage}
            handleChangeLimit={setLimit}
            isLoading={isLoading}
            isError={isError}
            error={error}
            getRowId={(row) => String(row.id)}
            enableSorting
          />
        ) : (
          <div className="rounded-md border border-dashed px-4 py-6 text-sm text-muted-foreground">
            Select a supplier to see all challans that can be converted into a
            GRN.
          </div>
        )}
      </div>
    </CustomLayout>
  );
};

export default GrnViaChallan;
