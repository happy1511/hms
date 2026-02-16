"use client";
import CustomActionDropdown from "@/components/common/CustomActionDropdown";
import CustomButton from "@/components/common/CustomButton";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import { SortableHeader } from "@/components/common/SortableHeader";
import TransactionsModal from "@/components/common/TransactionsModal";
import AddInvoiceItemModal from "@/components/opd/AddInvoiceItemModal";
import AddVitalsModal from "@/components/opd/AddVitalsModal";
import { PatientViewModal } from "@/components/patient/PatientView";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useInfiniteDoctorList } from "@/hooks/query/doctor";
import { useOpdList } from "@/hooks/query/opd";
import {
  ColumnDefWithClass,
  FilterConfig,
  FilterValues,
  OPDType,
  PatientType,
} from "@/lib/type";
import { formatAge, hasActionPermission } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const Buttons = ({ canCreate = false }: { canCreate?: boolean }) => {
  const router = useRouter();
  return (
    <>
      {canCreate && (
        <CustomButton
          onClick={() => router.push("/patient/search?opdCreate=true")}
        >
          New OPD
        </CustomButton>
      )}
    </>
  );
};

const Actions = ({ data }: { data: OPDType }) => {
  const [addInvoiceItemModal, setAddInvoiceItemModal] = useState(false);
  const [addVitalsModal, setAddVitalsModal] = useState(false);
  const router = useRouter();

  return (
    <>
      <CustomActionDropdown
        triggerLabel="Actions"
        groups={[
          {
            items: [
              {
                label: "Add Invoice Item",
                onClick: () => setAddInvoiceItemModal(true),
              },
            ],
            label: "Invoice",
          },
          {
            items: [
              {
                label: "Create New OPD",
                onClick: () => router.push(`/opd/bill/${data.patient.id}`),
              },
              {
                label: "Vitals",
                onClick: () => setAddVitalsModal(true),
              },
              {
                label: "View Consultation File",
                onClick: () => router.push(`/opd/consultation/${data.id}`),
              },
            ],
            label: "OPD",
          },
        ]}
      />
      <AddInvoiceItemModal
        billId={data.id}
        billPaid={0}
        billTotal={data.total}
        open={addInvoiceItemModal}
        onOpenChange={setAddInvoiceItemModal}
        trigger={<></>}
      />
      <AddVitalsModal
        opdId={data.id}
        open={addVitalsModal}
        onOpenChange={setAddVitalsModal}
        trigger={<></>}
        vital={data.vital}
      />
    </>
  );
};

const OPDs = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({});
  const [consultantValue, setConsultantValue] = useState("");

  const {
    data: consultingDoctors,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteDoctorList(
    {
      doctorType: "consulting",
      name: consultantValue,
    },
    10,
  );
  const { data: profile } = useProfile(false);
  const { data, isLoading, isError, error } = useOpdList(filters, page, limit);

  const flatConsultingDoctors = useMemo(
    () =>
      consultingDoctors?.pages.flatMap((p) =>
        p.data.flatMap((f) => ({ label: f.user.name, value: f.userId })),
      ),
    [consultingDoctors],
  );

  if (!profile) {
    return <></>;
  }

  const canView = hasActionPermission(
    profile?.data,
    ModuleType.OPD_BILL,
    ActionType.VIEW,
  );

  const canCreate = hasActionPermission(
    profile?.data,
    ModuleType.OPD_BILL,
    ActionType.CREATE,
  );

  const columns: ColumnDefWithClass<OPDType>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return <SortableHeader<OPDType> label="OPD" column={column} />;
      },
      cell: ({ row }) => <span>{row.index + 1}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "patientName",
      header: ({ column }) => {
        return <SortableHeader<OPDType> label="Patient" column={column} />;
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
            {row.original.isInQueue && (
              <div className="text-[10px] bg-orange-200 inline px-2">
                In Queue{" "}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "createdDate",
      header: ({ column }) => {
        return <SortableHeader<OPDType> label="Date/Time" column={column} />;
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
        return <SortableHeader<OPDType> label="Consultant" column={column} />;
      },
      cell: ({ row }) => (
        <div className="flex items-center text-tiny gap-2">
          {row.original.consultantDoctor.user.name}
        </div>
      ),
    },
    {
      accessorKey: "consultant",
      header: ({ column }) => {
        return <SortableHeader<OPDType> label="	Referred By" column={column} />;
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
        return <SortableHeader<OPDType> label="Total" column={column} />;
      },
      cell: ({ row }) => (
        <div className="flex items-center text-tiny gap-2">
          ₹ {row.original.rate}
        </div>
      ),
    },
    {
      accessorKey: "discount",
      header: ({ column }) => {
        return <SortableHeader<OPDType> label="Discount" column={column} />;
      },
      cell: ({ row }) => (
        <div className="flex items-center text-tiny gap-2">
          ₹{" "}
          {row.original.discountType === "PERCENTAGE"
            ? (row.original.discountValue * row.original.rate) / 100
            : row.original.discountValue}
        </div>
      ),
    },

    {
      accessorKey: "final",
      header: ({ column }) => {
        return <SortableHeader<OPDType> label="Final" column={column} />;
      },
      cell: ({ row }) => (
        <div className="flex items-center text-tiny gap-2">
          ₹ {row.original.total}
        </div>
      ),
    },
    {
      accessorKey: "paid",
      header: ({ column }) => {
        return <SortableHeader<OPDType> label="Paid" column={column} />;
      },
      cell: ({ row }) => (
        <div>
          ₹{" "}
          {row.original.transactions?.reduce((accumulator, currentItem) => {
            return accumulator + currentItem.amount;
          }, 0)}
          <TransactionsModal
            billId={row.original.id}
            patientName={`${row.original.patient.firstName} ${row.original.patient.lastName}`}
            data={row.original.transactions || []}
            trigger={<div className="text-blue-400">Details</div>}
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
      valueKey: "consultantDoctorId",
      type: "infiniteSelect",
      placeholder: "Search by name here.",
      options: flatConsultingDoctors,
      isFetchingNextPage,
      hasNextPage,
      fetchNextPage,
      onSearch: setConsultantValue,
    },
  ];

  return (
    <CustomLayout
      title="Walk In Queue"
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

export default OPDs;
