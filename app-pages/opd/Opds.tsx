"use client";
import CustomActionDropdown, {
  DropdownItem,
} from "@/components/common/CustomActionDropdown";
import { CustomAlert } from "@/components/common/CustomAlert";
import CustomButton from "@/components/common/CustomButton";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import NoPermission from "@/components/common/NoPermission";
import { SortableHeader } from "@/components/common/SortableHeader";
import TransactionsModal from "@/components/common/TransactionsModal";
import AddInvoiceItemModal from "@/components/opd/AddInvoiceItemModal";
import AddVitalsModal from "@/components/opd/AddVitalsModal";
import ChangeOpdDateTimeModal from "@/components/opd/ChangeOpdDateTimeModal";
import ChangeOpdDoctorModal from "@/components/opd/ChangeOpdDoctorModal";
import ChangeOpdStatusModal from "@/components/opd/ChangeOpdStatusModal";
import PrintConsultationModal from "@/components/opd/PrintConsultationModal";
import ViewInvoiceModal from "@/components/opd/ViewInvoiceModal";
import PatientDocumentsModal from "@/components/patient/PatientDocumentsModal";
import { PatientViewModal } from "@/components/patient/PatientView";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useInfiniteDoctorList } from "@/hooks/query/doctor";
import { useDeleteOpd, useOpdList } from "@/hooks/query/opd";
import {
  ColumnDefWithClass,
  Doctor,
  FilterConfig,
  FilterValues,
  OPDType,
  PaginatedResponse,
  PatientType,
} from "@/lib/type";
import { formatAge, hasActionPermission } from "@/lib/utils";
import { endOfDay, format, isSameDay, startOfDay } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CERTIFICATES_MODULE = "CERTIFICATES" as ModuleType;

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

const Actions = ({
  canDelete,
  canCreateCertificates,
  canView,
  canPrint,
  canUpdate,
  data,
  onPrintConsultPage,
}: {
  canDelete: boolean;
  canCreateCertificates: boolean;
  canView: boolean;
  canPrint: boolean;
  canUpdate: boolean;
  data: OPDType;
  onPrintConsultPage: (opd: OPDType) => void;
}) => {
  const [addInvoiceItemModal, setAddInvoiceItemModal] = useState(false);
  const [viewInvoiceModal, setViewInvoiceModal] = useState(false);
  const [addVitalsModal, setAddVitalsModal] = useState(false);
  const [confirmNewOpdOpen, setConfirmNewOpdOpen] = useState(false);
  const [confirmAddToIpdOpen, setConfirmAddToIpdOpen] = useState(false);
  const [changeDateTimeOpen, setChangeDateTimeOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewDocumentsOpen, setViewDocumentsOpen] = useState(false);
  const router = useRouter();
  const { mutateAsync: deleteOpd, isPending: deletePending } = useDeleteOpd();
  const canDeleteToday = canDelete && isSameDay(new Date(data.createdAt), new Date());
  const invoiceItems: DropdownItem[] = [
    {
      label: "View Invoice",
      onClick: () => setViewInvoiceModal(true),
    },
  ];

  if (canUpdate) {
    invoiceItems.unshift({
      label: "Add Invoice Item",
      onClick: () => setAddInvoiceItemModal(true),
    });
  }

  if (canPrint) {
    invoiceItems.push({
      label: "Print Invoice",
      onClick: () => setViewInvoiceModal(true),
    });
  }

  const opdItems: DropdownItem[] = [
    {
      label: "View Consultation File",
      onClick: () => router.push(`/opd/consultation/${data.id}`),
    },
    {
      label: "View Documents",
      onClick: () => setViewDocumentsOpen(true),
      disabled: !canView,
    },
  ];

  if (canCreateCertificates) {
    opdItems.push(
      {
        label: "Create Medical Certificate",
        onClick: () =>
          router.push(`/certificates?opdId=${data.id}&tab=${encodeURIComponent("MEDICAL")}`),
      },
      {
        label: "Create Fitness Certificate",
        onClick: () =>
          router.push(`/certificates?opdId=${data.id}&tab=${encodeURIComponent("FITNESS")}`),
      },
    );
  }

  if (canUpdate) {
    opdItems.unshift(
      {
        label: "Upload Document",
        onClick: () => {
          const params = new URLSearchParams({
            opdId: String(data.id),
            patientId: String(data.patient.id),
            patientName: [
              data.patient.title ? `${data.patient.title}.` : "",
              data.patient.firstName,
              data.patient.lastName,
            ]
              .filter(Boolean)
              .join(" "),
          });
          window.open(`/patient/documents/upload?${params.toString()}`, "_blank");
        },
      },
      {
        label: "Create New OPD",
        onClick: () => setConfirmNewOpdOpen(true),
      },
      {
        label: "Add to IPD",
        onClick: () => setConfirmAddToIpdOpen(true),
      },
      {
        label: "Change Date/Time",
        onClick: () => setChangeDateTimeOpen(true),
      },
      {
        label: "Vitals",
        onClick: () => setAddVitalsModal(true),
      },
    );
  }

  if (canPrint) {
    opdItems.push({
      label: "Print Consult Page",
      onClick: () => onPrintConsultPage(data),
    });
  }

  if (canDeleteToday) {
    opdItems.push({
      label: "Delete OPD",
      onClick: () => setDeleteOpen(true),
    });
  }

  return (
    <>
      <CustomActionDropdown
        triggerLabel="Actions"
        groups={[
          {
            items: invoiceItems,
            label: "Invoice",
          },
          {
            items: opdItems,
            label: "OPD",
          },
        ].filter((group) => group.items.length > 0)}
      />
      <AddInvoiceItemModal
        billId={data.invoice.id}
        billPaid={0}
        billTotal={data.invoice.total}
        open={addInvoiceItemModal}
        onOpenChange={setAddInvoiceItemModal}
        trigger={<div />}
      />
      <AddVitalsModal
        opdId={data.id}
        open={addVitalsModal}
        onOpenChange={setAddVitalsModal}
        trigger={<div />}
        vital={data.vital}
      />
      <ViewInvoiceModal
        opd={data}
        open={viewInvoiceModal}
        onOpenChange={setViewInvoiceModal}
        trigger={<div />}
      />
      <ChangeOpdDateTimeModal
        opd={data}
        open={changeDateTimeOpen}
        onOpenChange={setChangeDateTimeOpen}
      />
      <CustomAlert
        open={confirmNewOpdOpen}
        onOpenChange={setConfirmNewOpdOpen}
        triggerButton={<div />}
        title="Create New OPD?"
        description="Do you want to create a new OPD for this patient?"
        cancelText="Cancel"
        confirmText="Continue"
        iconType="confirm"
        confirmVariant="default"
        handleConfirm={() => router.push(`/opd/bill/${data.patient.id}`)}
      />
      <CustomAlert
        open={confirmAddToIpdOpen}
        onOpenChange={setConfirmAddToIpdOpen}
        triggerButton={<div />}
        title="Create IPD?"
        description="Do you want to convert this patient to IPD?"
        cancelText="Cancel"
        confirmText="Continue"
        iconType="confirm"
        confirmVariant="default"
        handleConfirm={() => router.push(`/ipd/bill/${data.patient.id}`)}
      />
      <CustomAlert
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        triggerButton={<div />}
        title="Delete OPD?"
        description="This will soft delete the OPD and linked invoice, transactions, pathology orders and radiology orders."
        cancelText="Cancel"
        confirmText="Delete"
        iconType="delete"
        confirmVariant="destructive"
        pending={deletePending}
        handleConfirm={() => deleteOpd({ opdId: data.id })}
      />
      <PatientDocumentsModal
        open={viewDocumentsOpen}
        onOpenChange={setViewDocumentsOpen}
        opdId={data.id}
        title={`Documents: OPD #${data.id}`}
        description={[
          data.patient.title ? `${data.patient.title}.` : "",
          data.patient.firstName,
          data.patient.lastName,
        ]
          .filter(Boolean)
          .join(" ")}
      />
    </>
  );
};

interface OPDsProps {
  externalFilters?: FilterValues;
  hideFilters?: boolean;
  embedded?: boolean;
  title?: string;
}

const OPDs = ({
  externalFilters,
  hideFilters = false,
  embedded = false,
  title = "Patient OPD",
}: OPDsProps) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({
    createdAt: {
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    },
  });
  const [consultantValue, setConsultantValue] = useState("");
  const [printConsultOpen, setPrintConsultOpen] = useState(false);
  const [printConsultOpd, setPrintConsultOpd] = useState<OPDType | null>(null);
  const [changeDoctorOpen, setChangeDoctorOpen] = useState(false);
  const [changeDoctorMode, setChangeDoctorMode] = useState<
    "consultant" | "referring"
  >("consultant");
  const [changeDoctorOpd, setChangeDoctorOpd] = useState<OPDType | null>(null);
  const [changeStatusOpen, setChangeStatusOpen] = useState(false);
  const [changeStatusOpd, setChangeStatusOpd] = useState<OPDType | null>(null);
  const effectiveFilters = externalFilters ?? filters;

  const consultantQuery = useInfiniteDoctorList(
    {
      doctorType: "consulting",
      name: consultantValue,
    },
    10,
  );
  const { data: profile } = useProfile(false);
  const { data, isLoading, isFetching, refetch, isError, error } = useOpdList(
    effectiveFilters,
    page,
    limit,
  );

  if (!profile) {
    return <div />;
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
  const canUpdate = hasActionPermission(
    profile?.data,
    ModuleType.OPD_BILL,
    ActionType.UPDATE,
  );
  const canPrint = hasActionPermission(
    profile?.data,
    ModuleType.OPD_BILL,
    ActionType.PRINT,
  );
  const canDelete = hasActionPermission(
    profile?.data,
    ModuleType.OPD_BILL,
    ActionType.DELETE,
  );
  const canCreateCertificates = hasActionPermission(
    profile?.data,
    CERTIFICATES_MODULE,
    ActionType.CREATE,
  );

  const columns: ColumnDefWithClass<OPDType>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return <SortableHeader<OPDType> label="OPD" column={column} />;
      },
      cell: ({ row }) => <span>{row.original.id}</span>,
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
                    row.original.patient.title + ".",
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
            <div
              className="text-[10px] bg-orange-200 inline px-2 cursor-pointer"
              onClick={() => {
                setChangeStatusOpd(row.original);
                setChangeStatusOpen(true);
              }}
            >
              {String(row.original.status || "--")}
            </div>
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
          {format(row.original.opdDateTime, "dd/MM - h:mma")}
        </div>
      ),
    },
    {
      accessorKey: "consultant",
      header: ({ column }) => {
        return <SortableHeader<OPDType> label="Consultant" column={column} />;
      },
      cell: ({ row }) => (
        <div>
          <div className="flex items-center text-tiny gap-2">
            {row.original.patient.title + "."}{" "}
            {row.original.consultantDoctor.user.name}
          </div>
          {canUpdate && (
            <div
              className="text-blue-400 hover:underline cursor-pointer text-[10px]"
              onClick={() => {
                setChangeDoctorOpd(row.original);
                setChangeDoctorMode("consultant");
                setChangeDoctorOpen(true);
              }}
            >
              Change
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "referring",
      header: ({ column }) => {
        return <SortableHeader<OPDType> label="	Referred By" column={column} />;
      },
      cell: ({ row }) => (
        <div>
          <div className="flex items-center text-tiny gap-2">
            {row.original.referringDoctor
              ? row.original.referringDoctor.user.title +
                ". " +
                row.original.referringDoctor.user.name
              : "-- none --"}
          </div>
          {canUpdate && (
            <div
              className="text-blue-400 hover:underline cursor-pointer text-[10px]"
              onClick={() => {
                setChangeDoctorOpd(row.original);
                setChangeDoctorMode("referring");
                setChangeDoctorOpen(true);
              }}
            >
              Change
            </div>
          )}
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
          ₹ {row.original.invoice.rate}
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
        return <SortableHeader<OPDType> label="Final" column={column} />;
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
        return <SortableHeader<OPDType> label="Paid" column={column} />;
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
            printModule={ModuleType.OPD_BILL}
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
      cell: ({ row }) => (
        <Actions
          canDelete={Boolean(canDelete)}
          canCreateCertificates={Boolean(canCreateCertificates)}
          canView={Boolean(canView)}
          canPrint={Boolean(canPrint)}
          canUpdate={Boolean(canUpdate)}
          data={row.original}
          onPrintConsultPage={(opd) => {
            setPrintConsultOpd(opd);
            setPrintConsultOpen(true);
          }}
        />
      ),
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

  const content = canView ? (
    <>
      {!hideFilters && (
        <CustomFilters<FilterValues>
          filters={neededFilters}
          defaultValues={filters}
          onRefresh={refetch}
          isLoading={isLoading || isFetching}
          isRefreshing={isFetching}
          filtersContainerClassName="grid-cols-1 md:grid-cols-2"
          onSubmit={(values) => {
            setFilters(values);
            setPage(1);
          }}
        />
      )}
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
      <PrintConsultationModal
        open={printConsultOpen}
        onOpenChange={(open) => {
          setPrintConsultOpen(open);
          if (!open) setPrintConsultOpd(null);
        }}
        opdId={printConsultOpd?.id ?? null}
        currentConsultantName={
          printConsultOpd?.consultantDoctor?.user?.name ?? null
        }
      />
      <ChangeOpdDoctorModal
        open={changeDoctorOpen}
        onOpenChange={(open) => {
          setChangeDoctorOpen(open);
          if (!open) setChangeDoctorOpd(null);
        }}
        opd={changeDoctorOpd}
        mode={changeDoctorMode}
      />
      <ChangeOpdStatusModal
        open={changeStatusOpen}
        onOpenChange={(open) => {
          setChangeStatusOpen(open);
          if (!open) setChangeStatusOpd(null);
        }}
        opd={changeStatusOpd}
      />
    </>
  ) : (
    <NoPermission />
  );

  if (embedded) {
    return content;
  }

  return (
    <CustomLayout
      title={title}
      buttons={<Buttons canCreate={Boolean(canCreate)} />}
    >
      {content}
    </CustomLayout>
  );
};

export default OPDs;
