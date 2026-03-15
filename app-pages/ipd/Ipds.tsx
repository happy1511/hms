"use client";
import CustomActionDropdown, {
  DropdownGroup,
  DropdownItem,
} from "@/components/common/CustomActionDropdown";
import { CustomAlert } from "@/components/common/CustomAlert";
import CustomButton from "@/components/common/CustomButton";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import { SortableHeader } from "@/components/common/SortableHeader";
import ChangeIpdBillingTypeModal from "@/components/ipd/ChangeIpdBillingTypeModal";
import ChangeIpdDateTimeModal from "@/components/ipd/ChangeIpdDateTimeModal";
import ChangeIpdDoctorModal from "@/components/ipd/ChangeIpdDoctorModal";
import ReallocateIpdBedModal from "@/components/ipd/ReallocateIpdBedModal";
import AddInvoiceItemModal from "@/components/opd/AddInvoiceItemModal";
import AddPaymentModal from "@/components/opd/AddPayment";
import ViewInvoiceModal from "@/components/opd/ViewInvoiceModal";
import { PatientViewModal } from "@/components/patient/PatientView";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useInfiniteDoctorList } from "@/hooks/query/doctor";
import {
  useCancelDischargeIpd,
  useDischargeIpd,
  useIpdList,
} from "@/hooks/query/ipd";
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
import { endOfDay, format, startOfDay } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";

const toDateOrNull = (value: unknown): Date | null => {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
};

const formatDuration = (from?: unknown, to?: unknown) => {
  const start = toDateOrNull(from);
  const end = toDateOrNull(to);
  if (!start || !end) return "--";
  const ms = Math.max(0, end.getTime() - start.getTime());
  const totalMinutes = Math.floor(ms / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes || parts.length === 0) parts.push(`${minutes}m`);
  return parts.join(" ");
};

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

const Actions = ({
  canCreateDischarge,
  canCancelDischarge,
  canPrint,
  canUpdate,
  data,
  onChangeDoctor,
  dischargedList = false,
}: {
  canCreateDischarge: boolean;
  canCancelDischarge: boolean;
  canPrint: boolean;
  canUpdate: boolean;
  data: IPDType;
  onChangeDoctor: (mode: "consultant" | "referring", ipd: IPDType) => void;
  dischargedList?: boolean;
}) => {
  const [addInvoiceItemModal, setAddInvoiceItemModal] = useState(false);
  const [addPaymentModal, setAddPaymentModal] = useState(false);
  const [viewInvoiceModal, setViewInvoiceModal] = useState(false);
  const [dischargeModal, setDischargeModal] = useState(false);
  const [cancelDischargeModal, setCancelDischargeModal] = useState(false);
  const [reallocateBedOpen, setReallocateBedOpen] = useState(false);
  const [changeDateTimeOpen, setChangeDateTimeOpen] = useState(false);
  const [patientViewOpen, setPatientViewOpen] = useState(false);

  const { mutateAsync: dischargeIpd, isPending: dischargePending } =
    useDischargeIpd();
  const { mutateAsync: cancelDischargeIpd, isPending: cancelDischargePending } =
    useCancelDischargeIpd();
  const invoiceItems: DropdownItem[] = [
    {
      label: "View Invoice",
      onClick: () => setViewInvoiceModal(true),
    },
  ];

  if (!dischargedList && canUpdate) {
    invoiceItems.unshift(
      {
        label: "Add Invoice Item",
        onClick: () => setAddInvoiceItemModal(true),
      },
      {
        label: "Add Payment",
        onClick: () => setAddPaymentModal(true),
      },
    );
  }

  if (!dischargedList && canPrint) {
    invoiceItems.push({
      label: "Print Invoice",
      onClick: () => setViewInvoiceModal(true),
    });
  }

  const actionsGroups: DropdownGroup[] = [
    {
      items: invoiceItems,
      label: "Invoice",
    },
  ];

  const ipdItems: DropdownItem[] = [];

  if (!dischargedList && canUpdate) {
    ipdItems.push(
      {
        label: "Reallocate Bed",
        onClick: () => setReallocateBedOpen(true),
      },
      {
        label: "Reassign Consultant",
        onClick: () => onChangeDoctor("consultant", data),
      },
      {
        label: "Reassign Referred By",
        onClick: () => onChangeDoctor("referring", data),
      },
      {
        label: "Change IPD Date/Time",
        onClick: () => setChangeDateTimeOpen(true),
      },
    );
  }

  if (dischargedList) {
    ipdItems.push({
      label: "View Patient Profile",
      onClick: () => setPatientViewOpen(true),
    });
  }

  if (!data.isDischarged && canCreateDischarge) {
    ipdItems.push({
      label: "Discharge Patient",
      onClick: () => setDischargeModal(true),
    });
  }

  if (data.isDischarged && canCancelDischarge) {
    ipdItems.push({
      label: "Cancel Discharge",
      onClick: () => setCancelDischargeModal(true),
    });
  }

  if (data.isDischarged && canPrint) {
    ipdItems.push({
      label: "Print Admission",
      onClick: () => window.open(`/ipd/admission-print/${data.id}`, "_blank"),
    });
  }

  if (ipdItems.length) {
    actionsGroups.push({
      items: ipdItems,
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

      {dischargedList && (
        <PatientViewModal
          data={data.patient as PatientType}
          open={patientViewOpen}
          onOpenChange={setPatientViewOpen}
          trigger={<div />}
        />
      )}

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

      <CustomAlert
        triggerButton={<div />}
        open={cancelDischargeModal}
        onOpenChange={setCancelDischargeModal}
        title="Cancel Discharge?"
        description="Are you sure you want to cancel discharge for this patient?"
        cancelText="Cancel"
        confirmText="Continue"
        handleConfirm={() => cancelDischargeIpd({ ipdId: data.id })}
        pending={cancelDischargePending}
      />

      <ReallocateIpdBedModal
        open={reallocateBedOpen}
        onOpenChange={setReallocateBedOpen}
        ipd={data}
      />

      <ChangeIpdDateTimeModal
        open={changeDateTimeOpen}
        onOpenChange={setChangeDateTimeOpen}
        ipd={data}
      />
    </>
  );
};

const IPDs = ({ discharged = false }: { discharged?: boolean }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({
    createdAt: {
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    },
  });
  const [consultantValue, setConsultantValue] = useState("");
  const [changeDoctorOpen, setChangeDoctorOpen] = useState(false);
  const [changeDoctorMode, setChangeDoctorMode] = useState<
    "consultant" | "referring"
  >("consultant");
  const [changeDoctorIpd, setChangeDoctorIpd] = useState<IPDType | null>(null);

  const [changeBillingTypeOpen, setChangeBillingTypeOpen] = useState(false);
  const [changeBillingTypeIpd, setChangeBillingTypeIpd] =
    useState<IPDType | null>(null);


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
    discharged ? ("DISCHARGE_PATIENT" as ModuleType) : ModuleType.IPD_BILL,
    ActionType.VIEW,
  );

  const canCreate = hasActionPermission(
    profile?.data,
    ModuleType.IPD_BILL,
    ActionType.CREATE,
  );
  const canUpdate = hasActionPermission(
    profile?.data,
    ModuleType.IPD_BILL,
    ActionType.UPDATE,
  );
  const canPrint = hasActionPermission(
    profile?.data,
    ModuleType.IPD_BILL,
    ActionType.PRINT,
  );
  const canCreateDischarge = hasActionPermission(
    profile?.data,
    ModuleType.DISCHARGE_PATIENT,
    ActionType.CREATE,
  );
  const canCancelDischarge = hasActionPermission(
    profile?.data,
    ModuleType.DISCHARGE_PATIENT,
    ActionType.UPDATE,
  );

  const columns: ColumnDefWithClass<IPDType>[] = discharged
    ? [
        {
          accessorKey: "id",
          header: ({ column }) => (
            <SortableHeader<IPDType> label="IPD No" column={column} />
          ),
          cell: ({ row }) => <span>{row.original.id}</span>,
          headerClassName: "min-w-15 max-w-20",
          cellClassName: "min-w-15 max-w-20",
        },
        {
          accessorKey: "patientName",
          header: ({ column }) => (
            <SortableHeader<IPDType> label="Patient" column={column} />
          ),
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
          accessorKey: "consultant",
          header: ({ column }) => (
            <SortableHeader<IPDType> label="Consultant" column={column} />
          ),
          cell: ({ row }) => (
            <div className="flex items-center text-tiny gap-2">
              {row.original.consultantDoctor.user.name}
            </div>
          ),
        },
        {
          accessorKey: "createdAt",
          header: ({ column }) => (
            <SortableHeader<IPDType> label="IPD Date/Time" column={column} />
          ),
          cell: ({ row }) => (
            <div className="flex items-center text-tiny gap-2">
              {format(row.original.ipdDateTime, "dd/MM - h:mma")}
            </div>
          ),
        },
        {
          accessorKey: "dischargedAt",
          header: ({ column }) => (
            <SortableHeader<IPDType> label="Discharged Date" column={column} />
          ),
          cell: ({ row }) => (
            <div className="flex items-center text-tiny gap-2">
              {row.original.dischargedAt
                ? format(row.original.dischargedAt, "dd/MM - h:mma")
                : "--"}
            </div>
          ),
        },
        {
          accessorKey: "duration",
          header: ({ column }) => (
            <SortableHeader<IPDType> label="Duration" column={column} />
          ),
          cell: ({ row }) => (
            <div className="flex items-center text-tiny gap-2">
              {formatDuration(
                row.original.ipdDateTime,
                row.original.dischargedAt,
              )}
            </div>
          ),
        },
        {
          accessorKey: "billingType",
          header: ({ column }) => (
            <SortableHeader<IPDType> label="Billing Type" column={column} />
          ),
          cell: ({ row }) => (
            <div className="flex items-center text-tiny gap-2">
              {String(row.original.invoice.billingType)}
            </div>
          ),
        },
        {
          accessorKey: "referring",
          header: ({ column }) => (
            <SortableHeader<IPDType> label="Referred By" column={column} />
          ),
          cell: ({ row }) => (
            <div>
              <div className="flex items-center text-tiny gap-2">
                {row.original.referringDoctor
                  ? row.original.referringDoctor.user.name
                  : "-- none --"}
              </div>
              {canUpdate && (
                <div
                  className="text-blue-400 hover:underline cursor-pointer text-[10px]"
                  onClick={() => {
                    setChangeDoctorIpd(row.original);
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
          accessorKey: "action",
          header: "Actions",
          cell: ({ row }) => (
            <Actions
              canCreateDischarge={Boolean(canCreateDischarge)}
              canCancelDischarge={Boolean(canCancelDischarge)}
              canPrint={Boolean(canPrint)}
              canUpdate={Boolean(canUpdate)}
              data={row.original}
              dischargedList
              onChangeDoctor={(mode, ipd) => {
                setChangeDoctorIpd(ipd);
                setChangeDoctorMode(mode);
                setChangeDoctorOpen(true);
              }}
            />
          ),
        },
      ]
    : [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return <SortableHeader<IPDType> label="ID" column={column} />;
      },
      cell: ({ row }) => <span>{row.original.id}</span>,
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
                <div className="text-[10px] text-black/70">
                  {[
                    row.original.bed?.room?.roomType?.department?.name,
                    row.original.bed?.room?.roomType?.name,
                    row.original.bed?.room?.name,
                    row.original.bed?.name || row.original.bed?.bedNumber,
                  ]
                    .filter(Boolean)
                    .join(" / ") || "--"}
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
          {format(row.original.ipdDateTime, "dd/MM - h:mma")}
        </div>
      ),
    },
    {
      accessorKey: "billingType",
      header: ({ column }) => {
        return <SortableHeader<IPDType> label="Billing Type" column={column} />;
      },
      cell: ({ row }) => (
        <div>
          <div className="flex items-center text-tiny gap-2">
            {String(row.original.invoice.billingType)}
          </div>
          {canUpdate && (
            <div
              className="text-blue-400 hover:underline cursor-pointer text-[10px]"
              onClick={() => {
                setChangeBillingTypeIpd(row.original);
                setChangeBillingTypeOpen(true);
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
        return <SortableHeader<IPDType> label="	Referred By" column={column} />;
      },
      cell: ({ row }) => (
        <div>
          <div className="flex items-center text-tiny gap-2">
            {row.original.referringDoctor
              ? row.original.referringDoctor.user.name
              : "-- none --"}
          </div>
          {canUpdate && (
            <div
              className="text-blue-400 hover:underline cursor-pointer text-[10px]"
              onClick={() => {
                setChangeDoctorIpd(row.original);
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
      accessorKey: "consultant",
      header: ({ column }) => {
        return <SortableHeader<IPDType> label="Consultant" column={column} />;
      },
      cell: ({ row }) => (
        <div>
          <div className="flex items-center text-tiny gap-2">
            {row.original.consultantDoctor.user.name}
          </div>
          {canUpdate && (
            <div
              className="text-blue-400 hover:underline cursor-pointer text-[10px]"
              onClick={() => {
                setChangeDoctorIpd(row.original);
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
      accessorKey: "action",
      header: "Actions",
      cell: ({ row }) => (
        <Actions
          canCreateDischarge={Boolean(canCreateDischarge)}
          canCancelDischarge={Boolean(canCancelDischarge)}
          canPrint={Boolean(canPrint)}
          canUpdate={Boolean(canUpdate)}
          data={row.original}
          onChangeDoctor={(mode, ipd) => {
            setChangeDoctorIpd(ipd);
            setChangeDoctorMode(mode);
            setChangeDoctorOpen(true);
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

  return (
    <CustomLayout
      title="Patient IPD"
      buttons={<Buttons canCreate={Boolean(canCreate)} />}
    >
      {canView && (
        <>
          <CustomFilters<FilterValues>
            filters={neededFilters}
            defaultValues={filters}
            onSubmit={setFilters}
            filtersContainerClassName="grid-cols-2"
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
          <ChangeIpdDoctorModal
            open={changeDoctorOpen}
            onOpenChange={(open) => {
              setChangeDoctorOpen(open);
              if (!open) setChangeDoctorIpd(null);
            }}
            ipd={changeDoctorIpd}
            mode={changeDoctorMode}
          />
          <ChangeIpdBillingTypeModal
            open={changeBillingTypeOpen}
            onOpenChange={(open) => {
              setChangeBillingTypeOpen(open);
              if (!open) setChangeBillingTypeIpd(null);
            }}
            ipd={changeBillingTypeIpd}
          />
        </>
      )}
    </CustomLayout>
  );
};

export default IPDs;
