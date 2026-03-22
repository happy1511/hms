"use client";

import CustomActionDropdown from "@/components/common/CustomActionDropdown";
import CustomButton from "@/components/common/CustomButton";
import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import CustomTabs from "@/components/common/CustomTabs";
import NoPermission from "@/components/common/NoPermission";
import { CustomTable } from "@/components/common/CustomTable";
import { SortableHeader } from "@/components/common/SortableHeader";
import FormField from "@/components/form-inputs/FormField";
import ViewInvoiceModal from "@/components/opd/ViewInvoiceModal";
import { PatientViewModal } from "@/components/patient/PatientView";
import CashFlowAccounts from "@/app-pages/finance/CashFlowAccounts";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useInvoiceList } from "@/hooks/query/invoice";
import {
  ColumnDefWithClass,
  FilterConfig,
  FilterValues,
  InvoiceListRowType,
  PatientType,
} from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorMessage } from "@hookform/error-message";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormDateRangePicker } from "@/components/form-inputs/FormDateRange";

type InvoiceTab =
  | "search"
  | "opd"
  | "daycare"
  | "ipd"
  | "discharged"
  | "cashflow";

const tabFiltersConfig: FilterConfig<FilterValues>[] = [
  { label: "UHID", valueKey: "uhid", type: "text" },
  { label: "Billing Period", valueKey: "createdAt", type: "dateRange" },
];

const invoiceSearchValidator = z
  .object({
    invoiceId: z.coerce
      .number()
      .int()
      .min(0)
      .optional()
      .transform((v) => (v && v > 0 ? v : undefined)),
    uhid: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? v : undefined)),
    billingPeriod: z
      .object({
        from: z.coerce.date().optional(),
        to: z.coerce.date().optional(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    const hasDate = !!data.billingPeriod?.from || !!data.billingPeriod?.to;
    const hasUhid = !!data.uhid;
    const hasInvoiceId = !!data.invoiceId;

    if (!hasInvoiceId && !hasUhid && !hasDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please fill at least one field to search invoices",
        path: ["invoiceId"],
      });
    }
  });

type InvoiceSearchForm = z.infer<typeof invoiceSearchValidator>;

const formatCurrency = (value: unknown) => `₹ ${Number(value || 0).toFixed(2)}`;

const FinanceBilling = () => {
  const [activeTab, setActiveTab] = useState<InvoiceTab>("search");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchFilters, setSearchFilters] = useState<FilterValues | null>(null);
  const [tabFilters, setTabFilters] = useState<
    Partial<Record<InvoiceTab, FilterValues>>
  >({});
  const [viewInvoiceId, setViewInvoiceId] = useState<number | null>(null);
  const [viewInvoiceOpen, setViewInvoiceOpen] = useState(false);

  const router = useRouter();
  const { data: profile } = useProfile(false);

  const searchQuery = useInvoiceList(
    searchFilters ?? {},
    page,
    limit,
    !!searchFilters,
  );

  const opdTabFilters = tabFilters.opd ?? {};
  const dayCareTabFilters = tabFilters.daycare ?? {};
  const ipdTabFilters = tabFilters.ipd ?? {};
  const dischargedTabFilters = tabFilters.discharged ?? {};
  const opdQuery = useInvoiceList(
    { invoiceType: "opd", ...opdTabFilters },
    page,
    limit,
    activeTab === "opd",
  );
  const dayCareQuery = useInvoiceList(
    { invoiceType: "daycare", ...dayCareTabFilters },
    page,
    limit,
    activeTab === "daycare",
  );
  const ipdQuery = useInvoiceList(
    { invoiceType: "ipd", ...ipdTabFilters },
    page,
    limit,
    activeTab === "ipd",
  );
  const dischargedQuery = useInvoiceList(
    { invoiceType: "discharged", ...dischargedTabFilters },
    page,
    limit,
    activeTab === "discharged",
  );

  const searchForm = useForm<InvoiceSearchForm>({
    defaultValues: {
      invoiceId: undefined,
      uhid: undefined,
      billingPeriod: undefined,
    },
    resolver: zodResolver(invoiceSearchValidator) as any,
    reValidateMode: "onChange",
  });

  if (!profile) {
    return <div />;
  }

  const canViewBilling = hasActionPermission(
    profile.data,
    ModuleType.FINANCE_BILLING,
    ActionType.VIEW,
  );

  const getPermissionModule = (row: InvoiceListRowType) => {
    if (row.invoiceFor === "OPD") return ModuleType.OPD_BILL;
    if (row.invoiceFor === "IPD") return ModuleType.IPD_BILL;
    return ModuleType.FINANCE_BILLING;
  };

  const getActionItems = (row: InvoiceListRowType) => {
    const permissionModule = getPermissionModule(row);
    const canUpdate = hasActionPermission(
      profile.data,
      permissionModule,
      ActionType.UPDATE,
    );

    return [
      ...(canUpdate
        ? [
            {
              label: "Add Invoice Item",
              onClick: () => router.push(`/invoice/${row.id}?focus=items`),
            },
          ]
        : []),
      {
        label: "Payment History",
        onClick: () => router.push(`/invoice/${row.id}?modal=transactions`),
      },
      {
        label: "View Invoice",
        onClick: () => {
          setViewInvoiceId(row.id);
          setViewInvoiceOpen(true);
        },
      },
    ];
  };

  const commonColumns: ColumnDefWithClass<InvoiceListRowType>[] = [
    {
      accessorKey: "srno",
      header: ({ column }) => (
        <SortableHeader<InvoiceListRowType> label="SrNo" column={column} />
      ),
      cell: ({ row }) => <span>#{row.index + 1}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "id",
      header: ({ column }) => (
        <SortableHeader<InvoiceListRowType>
          label="Invoice No"
          column={column}
        />
      ),
      cell: ({ row }) => <span>{row.original.id}</span>,
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    },
    {
      accessorKey: "patient",
      header: ({ column }) => (
        <SortableHeader<InvoiceListRowType> label="Patient" column={column} />
      ),
      cell: ({ row }) => {
        const patient = row.original.patient as PatientType | null;
        if (!patient) return <span>--</span>;

        const label = [
          patient.title ? `${patient.title}.` : "",
          patient.firstName,
          patient.lastName,
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div>
            <PatientViewModal
              data={patient}
              trigger={
                <div className="uppercase text-tiny font-medium hover:bg-orange-100 inline cursor-pointer">
                  {label}
                </div>
              }
            />
            <div className="text-[10px]">{patient.uhid}</div>
          </div>
        );
      },
      headerClassName: "min-w-48",
      cellClassName: "min-w-48",
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <SortableHeader<InvoiceListRowType>
          label="Invoice Date"
          column={column}
        />
      ),
      cell: ({ row }) => format(new Date(row.original.createdAt), "dd/MM/yyyy"),
      headerClassName: "min-w-32",
      cellClassName: "min-w-32",
    },
    {
      accessorKey: "consultantDoctorName",
      header: ({ column }) => (
        <SortableHeader<InvoiceListRowType>
          label="Consultant"
          column={column}
        />
      ),
      cell: ({ row }) => row.original.consultantDoctorName ?? "--",
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "referredByName",
      header: ({ column }) => (
        <SortableHeader<InvoiceListRowType>
          label="Referred By"
          column={column}
        />
      ),
      cell: ({ row }) => row.original.referredByName ?? "--",
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "rate",
      header: ({ column }) => (
        <SortableHeader<InvoiceListRowType> label="Total" column={column} />
      ),
      cell: ({ row }) => formatCurrency(row.original.rate),
      headerClassName: "min-w-24 max-w-30",
      cellClassName: "min-w-24 max-w-30",
    },
    {
      accessorKey: "discountAmount",
      header: ({ column }) => (
        <SortableHeader<InvoiceListRowType> label="Discount" column={column} />
      ),
      cell: ({ row }) => formatCurrency(row.original.discountAmount),
      headerClassName: "min-w-24 max-w-30",
      cellClassName: "min-w-24 max-w-30",
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <SortableHeader<InvoiceListRowType> label="Final" column={column} />
      ),
      cell: ({ row }) => formatCurrency(row.original.total),
      headerClassName: "min-w-24 max-w-30",
      cellClassName: "min-w-24 max-w-30",
    },
    {
      accessorKey: "paidAmount",
      header: ({ column }) => (
        <SortableHeader<InvoiceListRowType> label="Paid" column={column} />
      ),
      cell: ({ row }) => formatCurrency(row.original.paidAmount),
      headerClassName: "min-w-24 max-w-30",
      cellClassName: "min-w-24 max-w-30",
    },
    {
      accessorKey: "action",
      header: "Actions",
      cell: ({ row }) => (
        <CustomActionDropdown
          triggerLabel="Actions"
          groups={[{ items: getActionItems(row.original) }]}
        />
      ),
      headerClassName: "min-w-24 max-w-30",
      cellClassName: "min-w-24 max-w-30",
    },
  ];

  const searchColumns: ColumnDefWithClass<InvoiceListRowType>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <SortableHeader<InvoiceListRowType>
          label="Invoice No"
          column={column}
        />
      ),
      cell: ({ row }) => <span>{row.original.id}</span>,
      headerClassName: "min-w-24 max-w-30",
      cellClassName: "min-w-24 max-w-30",
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <SortableHeader<InvoiceListRowType>
          label="Invoice Date"
          column={column}
        />
      ),
      cell: ({ row }) => format(new Date(row.original.createdAt), "dd/MM/yyyy"),
      headerClassName: "min-w-32",
      cellClassName: "min-w-32",
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <SortableHeader<InvoiceListRowType> label="Total" column={column} />
      ),
      cell: ({ row }) => formatCurrency(row.original.total),
      headerClassName: "min-w-24 max-w-30",
      cellClassName: "min-w-24 max-w-30",
    },
    {
      accessorKey: "paidAmount",
      header: ({ column }) => (
        <SortableHeader<InvoiceListRowType> label="Paid" column={column} />
      ),
      cell: ({ row }) => formatCurrency(row.original.paidAmount),
      headerClassName: "min-w-24 max-w-30",
      cellClassName: "min-w-24 max-w-30",
    },
    {
      accessorKey: "action",
      header: "Actions",
      cell: ({ row }) => (
        <CustomActionDropdown
          triggerLabel="Actions"
          groups={[{ items: getActionItems(row.original) }]}
        />
      ),
      headerClassName: "min-w-24 max-w-30",
      cellClassName: "min-w-24 max-w-30",
    },
  ];

  const renderTable = (
    query: typeof opdQuery,
    columns: ColumnDefWithClass<InvoiceListRowType>[] = commonColumns,
  ) => {
    return (
      <CustomTable
        columns={columns}
        data={query.data?.data ?? []}
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error ?? null}
        enableSorting
        page={page}
        limit={limit}
        total={query.data?.total ?? 0}
        handleChangePage={setPage}
        handleChangeLimit={setLimit}
        getRowId={(row) => String((row as InvoiceListRowType).id)}
      />
    );
  };

  return (
    <CustomLayout title="Invoices">
      {canViewBilling ? (
        <>
          <CustomTabs
            value={activeTab}
            onValueChange={(v) => {
              setActiveTab(v as InvoiceTab);
              setPage(1);
            }}
            defaultValue="search"
            tabs={[
          {
            value: "search",
            name: "Search Invoices",
            content: (
              <div className="space-y-3">
                <Form {...searchForm}>
                  <form
                    onSubmit={searchForm.handleSubmit((values) => {
                      const nextFilters: FilterValues = {
                        ...(values.invoiceId
                          ? { invoiceId: values.invoiceId }
                          : {}),
                        ...(values.uhid ? { uhid: values.uhid } : {}),
                        ...(values.billingPeriod?.from ||
                        values.billingPeriod?.to
                          ? {
                              createdAt: {
                                from: values.billingPeriod?.from,
                                to: values.billingPeriod?.to,
                              },
                            }
                          : {}),
                      };
                      setSearchFilters(nextFilters);
                      setPage(1);
                    })}
                    className="space-y-3"
                  >
                    <div className="grid grid-cols-2 space-y-3 gap-x-2">
                      <div>
                        <div className="relative grid grid-cols-5 border border-black/15 rounded-[4px]">
                          <Label className="text-tiny col-span-2 border-r border-black/15 px-2 bg-pink-50">
                            Invoice ID
                          </Label>
                          <div className="col-span-3">
                            <FormField<InvoiceSearchForm>
                              type="number"
                              name="invoiceId"
                              control={searchForm.control}
                              hideError
                            />
                          </div>
                        </div>
                        <ErrorMessage
                          name="invoiceId"
                          errors={searchForm.formState.errors}
                          render={({ message }) => (
                            <p className="font-semibold text-tiny! ms-1">
                              {message}
                            </p>
                          )}
                        />
                      </div>

                      <div>
                        <div className="relative grid grid-cols-5 border border-black/15 rounded-[4px]">
                          <Label className="text-tiny col-span-2 border-r border-black/15 px-2 bg-pink-50">
                            UHID
                          </Label>
                          <div className="col-span-3">
                            <FormField<InvoiceSearchForm>
                              type="text"
                              name="uhid"
                              control={searchForm.control}
                              hideError
                            />
                          </div>
                        </div>
                        <ErrorMessage
                          name="uhid"
                          errors={searchForm.formState.errors}
                          render={({ message }) => (
                            <p className="font-semibold text-tiny! ms-1">
                              {message}
                            </p>
                          )}
                        />
                      </div>

                      <div className="col-span-1">
                        <div className="grid grid-cols-5 border border-black/15 rounded-[4px]">
                          <Label className="text-tiny col-span-2 border-r border-black/15 px-2 bg-pink-50">
                            Date
                          </Label>
                          <div className="col-span-3">
                            <FormDateRangePicker
                              control={searchForm.control}
                              name="billingPeriod"
                              hideError
                              className="h-6! w-full bg-white shadow-none border-none text-tiny py-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <CustomButton type="submit">Search</CustomButton>
                      <CustomButton
                        type="button"
                        variant="outline"
                        className="bg-white text-black"
                        onClick={() => {
                          searchForm.reset({});
                          setSearchFilters(null);
                          setPage(1);
                        }}
                      >
                        Reset
                      </CustomButton>
                    </div>
                  </form>
                </Form>

                {searchFilters ? (
                  renderTable(searchQuery, searchColumns)
                ) : (
                  <div className="text-tiny text-muted-foreground">
                    Use the form above to search invoices.
                  </div>
                )}
              </div>
            ),
          },
          {
            value: "opd",
            name: "OPD Invoice",
            content: (
              <div className="space-y-3">
                <CustomFilters<FilterValues>
                  filters={tabFiltersConfig}
                  onSubmit={(values) => {
                    setTabFilters((prev) => ({ ...prev, opd: values }));
                    setPage(1);
                  }}
                />
                {renderTable(opdQuery)}
              </div>
            ),
          },
          {
            value: "daycare",
            name: "DayCare Invoices",
            content: (
              <div className="space-y-3">
                <CustomFilters<FilterValues>
                  filters={tabFiltersConfig}
                  onSubmit={(values) => {
                    setTabFilters((prev) => ({ ...prev, daycare: values }));
                    setPage(1);
                  }}
                />
                {renderTable(dayCareQuery)}
              </div>
            ),
          },
          {
            value: "ipd",
            name: "IPD Invoices",
            content: (
              <div className="space-y-3">
                <CustomFilters<FilterValues>
                  filters={tabFiltersConfig}
                  onSubmit={(values) => {
                    setTabFilters((prev) => ({ ...prev, ipd: values }));
                    setPage(1);
                  }}
                />
                {renderTable(ipdQuery)}
              </div>
            ),
          },
          {
            value: "discharged",
            name: "Discharged Patient Invoices",
            content: (
              <div className="space-y-3">
                <CustomFilters<FilterValues>
                  filters={tabFiltersConfig}
                  onSubmit={(values) => {
                    setTabFilters((prev) => ({ ...prev, discharged: values }));
                    setPage(1);
                  }}
                />
                {renderTable(dischargedQuery)}
              </div>
            ),
          },
          {
            value: "cashflow",
            name: "Cash Flow Accounts",
            content: <CashFlowAccounts />,
          },
        ]}
          />

          <ViewInvoiceModal
            open={viewInvoiceOpen}
            onOpenChange={(open) => {
              setViewInvoiceOpen(open);
              if (!open) setViewInvoiceId(null);
            }}
            invoiceId={viewInvoiceId ?? undefined}
          />
        </>
      ) : (
        <NoPermission />
      )}
    </CustomLayout>
  );
};

export default FinanceBilling;
