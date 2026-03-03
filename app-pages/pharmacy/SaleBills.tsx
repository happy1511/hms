"use client";

import CustomActionDropdown, {
  DropdownItem,
} from "@/components/common/CustomActionDropdown";
import { CustomAlert } from "@/components/common/CustomAlert";
import CustomButton from "@/components/common/CustomButton";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import { SortableHeader } from "@/components/common/SortableHeader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ViewSaleInvoiceModal from "@/components/pharmacy/ViewSaleInvoiceModal";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { DrugBillGetPayload } from "@/generated/prisma/models";
import { useProfile } from "@/hooks/query/auth";
import {
  useDeleteSaleBill,
  useSaleBillList,
} from "@/hooks/query/pharmacySaleBill";
import { ColumnDefWithClass, FilterConfig, FilterValues } from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";

type SaleBillData = DrugBillGetPayload<{
  include: {
    patient: true;
    doctor: { include: { user: true } };
    invoice: { include: { transactions: true } };
    saleItems: { include: { inventoryItem: { include: { drug: true } } } };
  };
}>;

const neededFilters: FilterConfig<FilterValues>[] = [
  { label: "Search", valueKey: "name", type: "text" },
  { label: "Created Date", valueKey: "createdAt", type: "dateRange" },
];

const Buttons = ({ canCreate }: { canCreate: boolean }) => {
  const router = useRouter();
  return (
    <>
      {canCreate && (
        <CustomButton onClick={() => router.push("/pharmacy/sale-bill/new")}>
          New Sale Bill
        </CustomButton>
      )}
    </>
  );
};

const TransactionsModal = ({
  open,
  onOpenChange,
  data,
  canPrint,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  data: SaleBillData;
  canPrint: boolean;
}) => {
  const patientName = data.patient
    ? `${data.patient.firstName} ${data.patient.lastName}`
    : "Walk-in Customer";

  const printAll = () => {
    window.open(`/pharmacy/sale-transactions/${data.id}`, "_blank");
  };

  const printSingle = (transactionId: number) => {
    window.open(
      `/pharmacy/sale-transactions/${data.id}?transactionId=${transactionId}`,
      "_blank",
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl! border-secondary border-4 bg-white">
        <DialogHeader>
          <DialogTitle className="text-black/60 text-sm">
            Sale Bill Transactions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 max-h-[70dvh] overflow-y-auto text-tiny">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="bg-blue-400 px-2 text-white">{patientName}</span>
              <span className="bg-blue-400 px-2 text-white">
                Sale Bill: #{data.id}
              </span>
            </div>
            {canPrint && (
              <CustomButton type="button" onClick={printAll}>
                Print All Receipts
              </CustomButton>
            )}
          </div>

          <table className="w-full border text-tiny">
            <thead className="bg-muted">
              <tr>
                <th>
                  <div className="px-2 py-1">#</div>
                </th>
                <th>
                  <div className="px-2 py-1">Receipt No.</div>
                </th>
                <th>
                  <div className="px-2 py-1">Amount</div>
                </th>
                <th>
                  <div className="px-2 py-1">Mode</div>
                </th>
                <th>
                  <div className="px-2 py-1">Date</div>
                </th>
                <th>
                  <div className="px-2 py-1">Remarks</div>
                </th>
                <th>
                  <div className="px-2 py-1">Action</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.invoice.transactions.length ? (
                data.invoice.transactions.map((txn, index) => (
                  <tr key={txn.id} className="border-t">
                    <td>
                      <div className="px-2 py-1 text-center">{index + 1}</div>
                    </td>
                    <td>
                      <div className="px-2 py-1">SB-RCPT-{txn.id}</div>
                    </td>
                    <td>
                      <div className="px-2 py-1 text-right">
                        Rs. {Number(txn.amount).toFixed(2)}
                      </div>
                    </td>
                    <td>
                      <div className="px-2 py-1">{txn.mode}</div>
                    </td>
                    <td>
                      <div className="px-2 py-1">
                        {txn.createdAt
                          ? format(txn.createdAt, "MMM dd, yyyy")
                          : "-"}
                      </div>
                    </td>
                    <td>
                      <div className="px-2 py-1">{txn.remarks || "-"}</div>
                    </td>
                    <td>
                      <div className="px-2 py-1">
                        {canPrint ? (
                          <button
                            className="text-blue-500 hover:underline"
                            type="button"
                            onClick={() => printSingle(txn.id)}
                          >
                            Print Receipt
                          </button>
                        ) : (
                          "-"
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>
                    <div className="px-2 py-6 text-center text-muted-foreground">
                      No transactions found
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Actions = ({
  data,
  canUpdate,
  canDelete,
  canPrint,
}: {
  data: SaleBillData;
  canUpdate: boolean;
  canDelete: boolean;
  canPrint: boolean;
}) => {
  const [deleteModal, setDeleteModal] = useState(false);
  const [transactionsOpen, setTransactionsOpen] = useState(false);
  const [viewInvoiceModal, setViewInvoiceModal] = useState(false);
  const { mutateAsync: deleteBill, isPending: deleting } = useDeleteSaleBill();
  const router = useRouter();
  const actions: DropdownItem[] = [];

  if (canUpdate) {
    actions.push({
      label: "Edit",
      onClick: () => router.push(`/pharmacy/sale-bill/${data.id}`),
    });
  }

  if (canDelete) {
    actions.push({
      label: "Delete",
      onClick: () => setDeleteModal(true),
    });
  }

  actions.push({
    label: "View Transactions",
    onClick: () => setTransactionsOpen(true),
  });

  if (canPrint) {
    actions.push({
      label: "Print Sale Invoice",
      onClick: () => setViewInvoiceModal(true),
    });
    actions.push({
      label: "Print Receipts",
      onClick: () => router.push(`/pharmacy/sale-transactions/${data.id}`),
    });
  }

  return (
    <>
      <CustomActionDropdown
        triggerLabel="Actions"
        groups={[
          {
            label: "Sale Bill",
            items: actions,
          },
        ]}
      />
      <CustomAlert
        triggerButton={<div />}
        title="Delete sale bill?"
        description="This will restore sold quantities back to inventory."
        cancelText="Cancel"
        confirmText="Delete"
        open={deleteModal}
        onOpenChange={setDeleteModal}
        pending={deleting}
        handleConfirm={() => deleteBill({ billId: data.id })}
      />
      <TransactionsModal
        open={transactionsOpen}
        onOpenChange={setTransactionsOpen}
        data={data}
        canPrint={canPrint}
      />
      <ViewSaleInvoiceModal
        billId={data.id}
        open={viewInvoiceModal}
        onOpenChange={setViewInvoiceModal}
        trigger={<div />}
      />
    </>
  );
};

const SaleBills = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({});

  const { data: profile } = useProfile(false);
  const { data, isLoading, isError, error } = useSaleBillList(
    filters,
    page,
    limit,
  );

  if (!profile) {
    return <div />;
  }

  const canView = hasActionPermission(
    profile?.data,
    ModuleType.PHARMACY_SALE_BILL,
    ActionType.VIEW,
  );
  const canCreate = hasActionPermission(
    profile?.data,
    ModuleType.PHARMACY_SALE_BILL,
    ActionType.CREATE,
  );
  const canUpdate = hasActionPermission(
    profile?.data,
    ModuleType.PHARMACY_SALE_BILL,
    ActionType.UPDATE,
  );
  const canDelete = hasActionPermission(
    profile?.data,
    ModuleType.PHARMACY_SALE_BILL,
    ActionType.DELETE,
  );
  const canPrint = hasActionPermission(
    profile?.data,
    ModuleType.PHARMACY_SALE_BILL,
    ActionType.PRINT,
  );

  const columns: ColumnDefWithClass<SaleBillData>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => <SortableHeader<SaleBillData> label="ID" column={column} />,
      cell: ({ row }) => <span>#{row.original.id}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "name",
      header: ({ column }) => <SortableHeader<SaleBillData> label="Bill Name" column={column} />,
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "patient",
      header: ({ column }) => <SortableHeader<SaleBillData> label="Patient" column={column} />,
      cell: ({ row }) =>
        row.original.patient
          ? `${row.original.patient.firstName} ${row.original.patient.lastName}`
          : "-",
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "doctor",
      header: ({ column }) => <SortableHeader<SaleBillData> label="Doctor" column={column} />,
      cell: ({ row }) => row.original.doctor?.user?.name ?? "-",
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "items",
      header: ({ column }) => <SortableHeader<SaleBillData> label="Items" column={column} />,
      cell: ({ row }) => row.original.saleItems.length,
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    },
    {
      accessorKey: "amount",
      header: ({ column }) => <SortableHeader<SaleBillData> label="Total" column={column} />,
      cell: ({ row }) => row.original.invoice.total,
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => <SortableHeader<SaleBillData> label="Created At" column={column} />,
      cell: ({ row }) =>
        row.original.invoice.createdAt
          ? format(row.original.invoice.createdAt, "MMM dd, yyyy")
          : "-",
      headerClassName: "min-w-30 max-w-40",
      cellClassName: "min-w-30 max-w-40",
    },
    {
      id: "actions",
      header: () => <p>Action</p>,
      cell: ({ row }) => (
        <Actions
          data={row.original}
          canUpdate={Boolean(canUpdate)}
          canDelete={Boolean(canDelete)}
          canPrint={Boolean(canPrint)}
        />
      ),
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    },
  ];

  return (
    <CustomLayout
      title="Pharmacy Sale Bills"
      buttons={<Buttons canCreate={Boolean(canCreate)} />}
    >
      {canView && (
        <>
          <CustomFilters<FilterValues>
            filters={neededFilters}
            onSubmit={setFilters}
          />
          <CustomTable
            columns={columns}
            data={data?.data || []}
            page={page}
            total={data?.total}
            enableSorting
            limit={limit}
            handleChangePage={setPage}
            isLoading={isLoading}
            handleChangeLimit={setLimit}
            getRowId={(row) => String(row.id)}
            isError={isError}
            error={error}
          />
        </>
      )}
    </CustomLayout>
  );
};

export default SaleBills;
