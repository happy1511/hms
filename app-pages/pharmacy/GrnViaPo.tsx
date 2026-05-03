"use client";

import CustomButton from "@/components/common/CustomButton";
import { CustomTable } from "@/components/common/CustomTable";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import { SortableHeader } from "@/components/common/SortableHeader";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import PurchaseOrderItemsModal from "@/components/pharmacy/PurchaseOrderItemsModal";
import { Form } from "@/components/ui/form";
import { DrugSupplier } from "@/generated/prisma/client";
import { ActionType, ModuleType, Status } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useInfiniteDrugSupplierList } from "@/hooks/query/drugSupplier";
import { usePurchaseOrderList } from "@/hooks/query/pharmacyPurchaseOrder";
import {
  ColumnDefWithClass,
  PaginatedResponse,
  PharmacyPurchaseOrderType,
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

type PurchaseOrderRow = PharmacyPurchaseOrderType;

const money = (value: number) => Number(value || 0).toFixed(2);

const GrnViaPo = () => {
  const router = useRouter();
  const { data: profile } = useProfile(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrderRow | null>(
    null,
  );
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
    data: orders,
    isLoading,
    isError,
    error,
  } = usePurchaseOrderList(
    {
      supplierId: selectedSupplier?.id,
      withoutGrn: true,
    },
    page,
    limit,
  );

  const columns: ColumnDefWithClass<PurchaseOrderRow>[] = [
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
        <SortableHeader<PurchaseOrderRow> label="ID" column={column} />
      ),
      cell: ({ row }) => row.original.id,
      headerClassName: "min-w-16",
      cellClassName: "min-w-16",
    },
    {
      accessorKey: "supplierName",
      header: ({ column }) => (
        <SortableHeader<PurchaseOrderRow> label="Supplier" column={column} />
      ),
      cell: ({ row }) => row.original.supplier.name || "-",
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "orderDate",
      header: ({ column }) => (
        <SortableHeader<PurchaseOrderRow> label="PO Date" column={column} />
      ),
      cell: ({ row }) => format(row.original.orderDate, "MMM dd, yyyy"),
      headerClassName: "min-w-28",
      cellClassName: "min-w-28",
    },
    {
      id: "itemsCount",
      header: ({ column }) => (
        <SortableHeader<PurchaseOrderRow>
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
        <SortableHeader<PurchaseOrderRow> label="Amount" column={column} />
      ),
      cell: ({ row }) =>
        money(
          row.original.items.reduce(
            (sum, item) => sum + Number(item.total || 0),
            0,
          ),
        ),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
    {
      id: "actions",
      header: () => <button className="flex">Actions</button>,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <CustomButton onClick={() => setSelectedOrder(row.original)}>
            View Items
          </CustomButton>
          <CustomButton onClick={() => router.push(`/pharmacy/form/grn/${row.original.id}`)}>
            Select
          </CustomButton>
        </div>
      ),
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
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
      <CustomLayout title="Create GRN via PO">
        <NoPermission />
      </CustomLayout>
    );
  }

  return (
    <CustomLayout title="Create GRN via PO">
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
            data={orders?.data || []}
            page={page}
            total={orders?.total}
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
            Select a supplier to see all purchase orders that can be converted
            into a GRN.
          </div>
        )}

        {selectedOrder && (
          <PurchaseOrderItemsModal
            open={Boolean(selectedOrder)}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedOrder(null);
              }
            }}
            order={selectedOrder}
          />
        )}
      </div>
    </CustomLayout>
  );
};

export default GrnViaPo;
