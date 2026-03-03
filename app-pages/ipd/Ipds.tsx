"use client";
import CustomActionDropdown from "@/components/common/CustomActionDropdown";
import { CustomAlert } from "@/components/common/CustomAlert";
import CustomButton from "@/components/common/CustomButton";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import { SortableHeader } from "@/components/common/SortableHeader";
import TransactionsModal from "@/components/common/TransactionsModal";
import AddInvoiceItemModal from "@/components/opd/AddInvoiceItemModal";
import AddPaymentModal from "@/components/opd/AddPayment";
import ViewInvoiceModal from "@/components/opd/ViewInvoiceModal";
import { PatientViewModal } from "@/components/patient/PatientView";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useInfiniteDoctorList } from "@/hooks/query/doctor";
import { useDischargeIpd, useIpdList } from "@/hooks/query/ipd";
import {
  ColumnDefWithClass,
  Doctor,
  FilterConfig,
  FilterValues,
  IPDType,
  PaginatedResponse,
  PatientType,
} from "@/lib/type";
import { formatAge, hasActionPermission } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Buttons = ({ canCreate = false }: { canCreate?: boolean }) => {
  const router = useRouter();
  return (
    <>
      {canCreate && (
        <CustomButton
          onClick={() => router.push("/patient/search?ipdCreate=true")}
        >
          New IPD
        </CustomButton>
      )}
    </>
  );
};

const Actions = ({ data }: { data: IPDType }) => {
  const [addInvoiceItemModal, setAddInvoiceItemModal] = useState(false);
  const [addPaymentModal, setAddPaymentModal] = useState(false);
  const [viewInvoiceModal, setViewInvoiceModal] = useState(false);
  const [dischargeModal, setDischargeModal] = useState(false);

  const { mutateAsync: dischargeIpd, isPending: dischargePending } =
    useDischargeIpd();
  const router = useRouter();

  const actionsGroups = [
    {
      items: [
        {
          label: "Add Invoice Item",
          onClick: () => setAddInvoiceItemModal(true),
        },
        {
          label: "View Invoice",
          onClick: () => router.push(`/invoice/${data.invoice.id}`),
        },
        {
          label: "Add Payment",
          onClick: () => setAddPaymentModal(true),
        },
        {
          label: "Print Invoice",
          onClick: () => setViewInvoiceModal(true),
        },
      ],
      label: "Invoice",
    },
  ];

  if (!data.isDischarged) {
    actionsGroups.push({
      items: [
        {
          label: "Discharge Patient",
          onClick: () => setDischargeModal(true),
        },
      ],
      label: "IPD",
    });
  }

  return (
    <>
      <CustomActionDropdown
        triggerLabel="Actions"
        groups={[...actionsGroups]}
      />

      <AddInvoiceItemModal
        billId={data.invoice.id}
        billPaid={0}
        billTotal={data.invoice.total}
        open={addInvoiceItemModal}
        onOpenChange={setAddInvoiceItemModal}
        trigger={<div />}
      />

      <AddPaymentModal
        billId={data.invoice.id}
        open={addPaymentModal}
        onOpenChange={setAddPaymentModal}
        trigger={<div />}
      />

      <ViewInvoiceModal
        invoiceId={data.invoice.id}
        open={viewInvoiceModal}
        onOpenChange={setViewInvoiceModal}
        trigger={<div />}
      />

      <CustomAlert
        triggerButton={<div />}
        open={dischargeModal}
        onOpenChange={setDischargeModal}
        title="Discharge Patient?"
        description="Are you sure you want to discharge patient?"
        cancelText="Cancel"
        confirmText="Delete"
        handleConfirm={() => dischargeIpd({ ipdId: data.id })}
        pending={dischargePending}
      />
    </>
  );
};

const IPDs = ({ discharged = false }: { discharged?: boolean }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({});
  const [consultantValue, setConsultantValue] = useState("");

  const consultantQuery = useInfiniteDoctorList(
    {
      doctorType: "consulting",
      name: consultantValue,
    },
    10,
  );
  const { data: profile } = useProfile(false);
  const { data, isLoading, isError, error } = useIpdList(
    { ...filters, isDischarged: !!discharged },
    page,
    limit,
  );

  if (!profile) {
    return <div />;
  }

  const canView = hasActionPermission(
    profile?.data,
    ModuleType.IPD_BILL,
    ActionType.VIEW,
  );

  const canCreate = hasActionPermission(
    profile?.data,
    ModuleType.IPD_BILL,
    ActionType.CREATE,
  );

  const columns: ColumnDefWithClass<IPDType>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return <SortableHeader<IPDType> label="IPD" column={column} />;
      },
      cell: ({ row }) => <span>{row.index + 1}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "patientName",
      header: ({ column }) => {
        return <SortableHeader<IPDType> label="Patient" column={column} />;
      },
      cell: ({ row }) => (
        <div>
          <div>
            <PatientViewModal
              data={row.original.patient as PatientType}
              trigger={
                <div className="uppercase text-tiny font-medium hover:bg-orange-100 inline cursor-pointer">
                  {[
                    row.original.patient.firstName,
                    row.original.patient.lastName,
                  ].join(" ")}
                </div>
              }
            />
            <div className="text-[10px]">
              {row.original.patient.gender},{" "}
              {formatAge(row.original.patient.dob)}{" "}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "createdDate",
      header: ({ column }) => {
        return <SortableHeader<IPDType> label="Date/Time" column={column} />;
      },
      cell: ({ row }) => (
        <div className="flex items-center text-tiny gap-2">
          {format(row.original.createdAt, "dd/MM - h:mma")}
        </div>
      ),
    },
    {
      accessorKey: "consultant",
      header: ({ column }) => {
        return <SortableHeader<IPDType> label="Consultant" column={column} />;
      },
      cell: ({ row }) => (
        <div className="flex items-center text-tiny gap-2">
          {row.original.consultantDoctor.user.name}
        </div>
      ),
    },
    {
      accessorKey: "referring",
      header: ({ column }) => {
        return <SortableHeader<IPDType> label="	Referred By" column={column} />;
      },
      cell: ({ row }) => (
        <div className="flex items-center text-tiny gap-2">
          {row.original.referringDoctor
            ? row.original.referringDoctor.user.name
            : "-- none --"}
        </div>
      ),
    },
    {
      accessorKey: "total",
      header: ({ column }) => {
        return <SortableHeader<IPDType> label="Total" column={column} />;
      },
      cell: ({ row }) => (
        <div className="flex items-center text-tiny gap-2">
          ₹ {row.original.invoice.rate}
        </div>
      ),
    },
    {
      accessorKey: "discount",
      header: ({ column }) => {
        return <SortableHeader<IPDType> label="Discount" column={column} />;
      },
      cell: ({ row }) => (
        <div className="flex items-center text-tiny gap-2">
          ₹{" "}
          {row.original.invoice.discountType === "PERCENTAGE"
            ? (row.original.invoice.discountValue * row.original.invoice.rate) /
              100
            : row.original.invoice.discountValue}
        </div>
      ),
    },

    {
      accessorKey: "final",
      header: ({ column }) => {
        return <SortableHeader<IPDType> label="Final" column={column} />;
      },
      cell: ({ row }) => (
        <div className="flex items-center text-tiny gap-2">
          ₹ {row.original.invoice.total}
        </div>
      ),
    },
    {
      accessorKey: "paid",
      header: ({ column }) => {
        return <SortableHeader<IPDType> label="Paid" column={column} />;
      },
      cell: ({ row }) => (
        <div>
          ₹{" "}
          {row.original.invoice.transactions?.reduce(
            (accumulator, currentItem) => {
              return accumulator + currentItem.amount;
            },
            0,
          )}
          <TransactionsModal
            billId={row.original.id}
            patientName={`${row.original.patient.firstName} ${row.original.patient.lastName}`}
            data={row.original.invoice.transactions || []}
            trigger={
              <div className="text-blue-400 hover:underline cursor-pointer">
                Details
              </div>
            }
          />
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Actions",
      cell: ({ row }) => <Actions data={row.original} />,
    },
  ];

  const neededFilters: FilterConfig<FilterValues>[] = [
    { label: "Created Date", valueKey: "createdAt", type: "dateRange" },
    {
      label: "Filter by Consultant",
      valueKey: "consultantDoctor",
      type: "infiniteSelect",
      placeholder: "Search by name here.",
      query: consultantQuery,
      getItems: (d) => (d as PaginatedResponse<Doctor>)?.data,
      valueKeyExtractor: (i) => String((i as Doctor).userId),
      labelKey: (i) => (i as Doctor).user.name,
      search: consultantValue,
      onSearchChange: setConsultantValue,
    },
  ];

  return (
    <CustomLayout
      title="Patient IPD"
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
            isError={isError}
            error={error}
            getRowId={(row) => String(row.id)}
          />
        </>
      )}
    </CustomLayout>
  );
};

export default IPDs;
