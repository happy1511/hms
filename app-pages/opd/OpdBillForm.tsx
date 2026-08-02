"use client";

import { CustomAlert } from "@/components/common/CustomAlert";
import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import NoPermission from "@/components/common/NoPermission";
import { SortableHeader } from "@/components/common/SortableHeader";
import FormField from "@/components/form-inputs/FormField";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import PostCreatePrintDialog from "@/components/opd/PostCreatePrintDialog";
import LocationCascadeFields from "@/components/patient/LocationCascadeFields";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { BillingSection } from "@/generated/prisma/client";
import {
  ActionType,
  AddressType,
  BloodGroup,
  ContactType,
  DiscountType,
  Gender,
  IdentityType,
  MlcInsuranceType,
  ModuleType,
  MaritalStatus,
  NameTitle,
  OpdArrival,
  PaymentCategory,
  PaymentMode,
  RelationshipType,
  Status,
  DoctorType,
} from "@/generated/prisma/enums";
import { useInfiniteBillingSectionsList } from "@/hooks/query/bllingSection";
import QuickCreateDoctorModal from "@/components/doctor/QuickCreateDoctorModal";
import { useInfiniteDoctorList } from "@/hooks/query/doctor";
import { useCreateOpd } from "@/hooks/query/opd";
import { useProfile } from "@/hooks/query/auth";
import { useGetPatient } from "@/hooks/query/patient";
import {
  useInfiniteServicesList,
  useConsultingDoctorService,
} from "@/hooks/query/service";
import {
  ColumnDefWithClass,
  Doctor,
  PaginatedResponse,
  PatientType,
  ServiceDataType,
} from "@/lib/type";
import { SYSTEM_BILLING_SECTION_NAMES } from "@/lib/systemBillingConstants";
import {
  fullName,
  getDiscountTypeOptions,
  hasActionPermission,
} from "@/lib/utils";
import {
  billingItemValidator,
  billingItemValidatorType,
  transactionsValidator,
  transactionValidatorType,
} from "@/validators/api/invoice/invoice";
import { PatientAddressValidatorType } from "@/validators/api/masters/patient";
import { opdValidator, opdValidatorType } from "@/validators/api/opd/opd";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, startOfDay, subYears } from "date-fns";
import { Edit2, LoaderIcon, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  useFieldArray,
  UseFieldArrayRemove,
  useForm,
  UseFormReturn,
} from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";

const getInitialValues = (data?: PatientType): opdValidatorType => {
  // ---------------- CONTACT MAP (only required types) ----------------
  const contactMap: Record<ContactType, string> = {
    [ContactType.PHONE]: "",
    [ContactType.MOBILE]: "",
    [ContactType.EMAIL]: "",
  };

  data?.contacts?.forEach((c) => {
    if (c.type in contactMap) {
      contactMap[c.type] = c.value;
    }
  });

  const identificationRows = [
    data?.identifications?.[0]
      ? {
          type: data.identifications[0].type,
          number: data.identifications[0].number,
          active: data.identifications[0].active,
        }
      : {
          type: IdentityType.ADHAR_CARD,
          number: "",
          active: Status.active,
        },
  ];

  // ---------------- HOME ADDRESS ----------------
  const homeAddress = data?.addresses?.find((a) => a.type === AddressType.HOME);

  const relations = data?.relations?.splice(0, 1);

  return {
    patientId: data?.id ?? undefined,
    invoice: {
      billingType: PaymentCategory["SELF_PAY"],
      billingItems: [],
      rate: 0,
      transactions: [],
      createdAt: new Date(),
      discountType: DiscountType["VALUE"],
      discountValue: 0,
      isFree: false,
      isPaid: "true" as any,
      total: 0,
    },
    patient: {
      title: data?.title ?? NameTitle["MR"],
      firstName: data?.firstName ?? "",
      middleName: data?.middleName ?? null,
      lastName: data?.lastName ?? "",
      preferredName: data?.preferredName ?? "",
      dob: data?.dob ? new Date(data.dob) : new Date(),
      identificationMark: data?.identificationMark ?? null,
      gender: data?.gender ?? Gender.Male,
      maritalStatus: data?.maritalStatus ?? MaritalStatus.Married,
      religion: data?.religion ?? "",
      bloodGroup: data?.bloodGroup ?? BloodGroup.A_NEGATIVE,
      isMlcPatient: data?.isMlcPatient ?? false,
      mlcInsuranceType: data?.mlcInsuranceType ?? null,
      mlcPolicyOrCardNumber: data?.mlcPolicyOrCardNumber ?? "",
      relations: relations ?? [],
      // ---------- ADDRESS ----------
      addresses: [
        {
          type: AddressType.HOME,
          addressLineOne: homeAddress?.addressLineOne ?? "",
          location: homeAddress?.location,
        } as PatientAddressValidatorType,
      ],

      // ---------- CONTACTS ----------
      contacts: [
        { type: ContactType.PHONE, value: contactMap[ContactType.PHONE] },
        { type: ContactType.MOBILE, value: contactMap[ContactType.MOBILE] },
        { type: ContactType.EMAIL, value: contactMap[ContactType.EMAIL] },
      ],

      // ---------- IDENTIFICATIONS ----------
      identifications: identificationRows,
      emergencyContacts: data?.emergencyContacts ?? [],
      notes: data?.notes ?? [],
    },

    arrivalState: OpdArrival.ROUTINE,
    consultantDoctor: { id: null },
  };
};

const Actions = ({
  data,
  remove,
  index,
  form,
}: {
  form:
    | UseFormReturn<billingItemValidatorType>
    | UseFormReturn<transactionValidatorType>;
  data: billingItemValidatorType | transactionValidatorType;
  remove: UseFieldArrayRemove;
  index: number;
}) => {
  return (
    <>
      <Button
        variant="outline"
        className="h-auto shadow-none p-1 cursor-pointer"
        onClick={() => form.reset({ ...data, index })}
        type="button"
      >
        <Edit2 className="size-2.5 text-destructive" />
      </Button>
      <CustomAlert
        triggerButton={
          <Button
            variant="outline"
            className="h-auto shadow-none p-1 cursor-pointer"
            type="button"
          >
            <Trash2 className="size-2.5 text-destructive" />
          </Button>
        }
        title="Delete item?"
        description="Are you sure you want to delete item?"
        cancelText="Cancel"
        confirmText="Delete"
        handleConfirm={() => remove(index)}
      />
    </>
  );
};

const BillingItems = ({ form }: { form: UseFormReturn<opdValidatorType> }) => {
  const [billingItemSearch, setBillingItemSearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");

  const { append, update, remove } = useFieldArray({
    name: "invoice.billingItems",
    control: form.control,
  });

  const billingItemForm = useForm<billingItemValidatorType>({
    resolver: zodResolver(billingItemValidator),
    defaultValues: {
      createdAt: new Date(),
      quantity: 1,
      rate: 0,
      discountType: DiscountType.VALUE,
      discountValue: 0,
      total: 0,
    },
  });

  const service = billingItemForm.watch("service");
  const quantity = billingItemForm.watch("quantity");
  const rate = billingItemForm.watch("rate");
  const discountValue = billingItemForm.watch("discountValue");
  const discountType = billingItemForm.watch("discountType");
  const addedBillingItems = form.watch("invoice.billingItems");
  const invoiceDiscountType = form.watch("invoice.discountType");
  const invoiceDiscountValue = form.watch("invoice.discountValue");
  const editingIndex = billingItemForm.watch("index");

  const billingItemQuery = useInfiniteBillingSectionsList(
    { name: billingItemSearch, status: Status["active"] },
    20,
  );
  const consultationBillingSectionQuery = useInfiniteBillingSectionsList(
    {
      name: SYSTEM_BILLING_SECTION_NAMES.CONSULTATION_CHARGES,
      status: Status["active"],
    },
    20,
  );

  const selectedBillingSection = billingItemForm.watch("billingSection");
  const billingSectionId = selectedBillingSection?.id;
  const servicesQuery = useInfiniteServicesList(
    {
      name: serviceSearch,
      status: Status["active"],
      billingSectionId: billingSectionId ? String(billingSectionId) : undefined,
    },
    20,
  );

  const consultantDoctor = form.watch("consultantDoctor") as Doctor | null;
  const consultantDoctorId = consultantDoctor?.id
    ? Number(consultantDoctor.id)
    : undefined;
  const { data: consultingDoctorService } =
    useConsultingDoctorService(consultantDoctorId);
  const consultantDoctorCharges = Number(
    consultantDoctor?.consultationCharges ??
      consultingDoctorService?.price ??
      0,
  );
  const consultationBillingSection = useMemo(
    () =>
      consultationBillingSectionQuery.data?.pages
        .flatMap((page) => page.data)
        .find((section) => section.isDoctorConsultationCharges) ?? null,
    [consultationBillingSectionQuery.data],
  );

  const flatServices = useMemo(
    () =>
      servicesQuery.data?.pages.flatMap((p) =>
        p.data.flatMap((f) => ({
          ...f,
          isEditableRate: Boolean(f.isEditableRate),
          label: f.name,
          value: f.id,
        })),
      ),
    [servicesQuery.data],
  );

  const canEditRate = Boolean(service?.isEditableRate);

  useEffect(() => {
    const existingConsultationIndex = (addedBillingItems || []).findIndex(
      (item) => Boolean(item?.billingSection?.isDoctorConsultationCharges),
    );
    const existingConsultationItem =
      existingConsultationIndex >= 0
        ? addedBillingItems?.[existingConsultationIndex]
        : null;

    if (!consultantDoctorId) {
      if (existingConsultationIndex >= 0) {
        remove(existingConsultationIndex);
      }
      return;
    }

    if (!consultationBillingSection?.id || !consultingDoctorService?.id) {
      return;
    }

    const nextItem = {
      billingSection: {
        id: Number(consultationBillingSection.id),
        name: consultationBillingSection.name,
        isOtherCharges: consultationBillingSection.isOtherCharges,
        isDoctorConsultationCharges:
          consultationBillingSection.isDoctorConsultationCharges,
      },
      service: {
        id: consultingDoctorService.id,
        name: consultingDoctorService.name,
        maxDiscount: consultingDoctorService.maxDiscount ?? 0,
        isEditableRate: Boolean(consultingDoctorService.isEditableRate),
      },
      createdAt: existingConsultationItem?.createdAt ?? new Date(),
      quantity: 1,
      rate: consultantDoctorCharges,
      discountType: DiscountType.VALUE,
      discountValue: 0,
      total: consultantDoctorCharges,
    } satisfies Partial<billingItemValidatorType>;

    if (
      existingConsultationItem &&
      Number(existingConsultationItem.billingSection?.id) ===
        Number(nextItem.billingSection.id) &&
      Number(existingConsultationItem.service?.id) ===
        Number(nextItem.service.id) &&
      Number(existingConsultationItem.rate) === Number(nextItem.rate) &&
      Number(existingConsultationItem.quantity) === Number(nextItem.quantity) &&
      existingConsultationItem.discountType === nextItem.discountType &&
      Number(existingConsultationItem.discountValue) ===
        Number(nextItem.discountValue) &&
      Number(existingConsultationItem.total) === Number(nextItem.total)
    ) {
      return;
    }

    if (existingConsultationIndex >= 0) {
      update(existingConsultationIndex, {
        ...existingConsultationItem,
        ...nextItem,
      } as billingItemValidatorType);
      return;
    }

    append(nextItem as billingItemValidatorType);
  }, [
    addedBillingItems,
    append,
    consultationBillingSection,
    consultantDoctorId,
    consultantDoctorCharges,
    consultingDoctorService,
    remove,
    update,
  ]);

  const columns: ColumnDefWithClass<billingItemValidatorType>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <SortableHeader<billingItemValidatorType>
            label="ID"
            column={column}
          />
        );
      },
      cell: ({ row }) => <span>#{row.index + 1}</span>,
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "serviceName",
      header: ({ column }) => {
        return (
          <SortableHeader<billingItemValidatorType>
            label="Name"
            column={column}
          />
        );
      },
      cell: ({ row }) => row.original.service?.name || "--",
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => {
        return (
          <SortableHeader<billingItemValidatorType>
            label="Quantity"
            column={column}
          />
        );
      },
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      accessorKey: "billingSectionName",
      header: ({ column }) => (
        <SortableHeader label="Billing Section" column={column} />
      ),
      cell: ({ row }) => row.original.billingSection.name,
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },

    {
      accessorKey: "rate",
      header: ({ column }) => {
        return (
          <SortableHeader<billingItemValidatorType>
            label="Rate"
            column={column}
          />
        );
      },
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },

    {
      accessorKey: "discountValue",
      header: ({ column }) => {
        return (
          <SortableHeader<billingItemValidatorType>
            label="Discount"
            column={column}
          />
        );
      },
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },

    {
      accessorKey: "total",
      header: ({ column }) => {
        return (
          <SortableHeader<billingItemValidatorType>
            label="Total"
            column={column}
          />
        );
      },
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },

    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <SortableHeader<billingItemValidatorType>
            label="Created at"
            column={column}
          />
        );
      },
      cell: ({ row }) => {
        return (
          <div className="flex">
            {(row.original.createdAt as Date) &&
              format(row.original.createdAt as Date, "MMM dd, yyyy")}
          </div>
        );
      },
      headerClassName: "min-w-40 max-w-50",
      cellClassName: "min-w-40 max-w-50",
    },
    {
      id: "actions",
      header: () => <p>Action</p>,
      cell: ({ row }) => (
        <Actions
          data={row.original}
          form={billingItemForm}
          index={row.index}
          remove={remove}
        />
      ),
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    },
  ];

  const handleAddUpdate = () => {
    billingItemForm.handleSubmit(() => {
      const values = billingItemForm.getValues();

      if (typeof values.index === "number") {
        update(values.index as number, {
          ...values,
        });
      } else {
        append({
          ...values,
        });
      }
      billingItemForm.reset({});
    })();
  };

  useEffect(() => {
    const setIfChanged = (name: keyof billingItemValidatorType, value: any) => {
      if (billingItemForm.getValues(name) !== value) {
        billingItemForm.setValue(name, value);
      }
    };

    if (!service?.id) {
      setIfChanged("rate", 0);
      setIfChanged("discountValue", 0);
      setIfChanged("discountType", DiscountType["VALUE"]);
      setIfChanged("total", 0);
      setIfChanged("quantity", 0);
      return;
    }

    const existingService = flatServices?.find(
      (s) => s.id === Number(service.id),
    );

    if (!existingService) {
      setIfChanged("rate", 0);
      setIfChanged("discountValue", 0);
      setIfChanged("discountType", DiscountType["VALUE"]);
      setIfChanged("total", 0);
      setIfChanged("quantity", 0);
      return;
    }

    setIfChanged("rate", existingService.price);
    setIfChanged("discountValue", 0);
    setIfChanged("discountType", DiscountType["VALUE"]);
    setIfChanged("total", existingService.price);
    setIfChanged("quantity", 1);
  }, [service, flatServices]);

  useEffect(() => {
    if (!service) return;

    const gross = Number(quantity) * Number(rate);

    const total =
      discountType === "PERCENTAGE"
        ? gross - (gross * Number(discountValue)) / 100
        : gross - Number(discountValue);

    if (billingItemForm.getValues("total") !== total) {
      billingItemForm.setValue("total", total);
    }
  }, [quantity, rate, discountType, discountValue, service]);

  const invoiceSummary = useMemo(() => {
    const subTotal = (addedBillingItems || []).reduce(
      (sum, item) => sum + Number(item.total || 0),
      0,
    );

    const discount =
      invoiceDiscountType === DiscountType["PERCENTAGE"]
        ? (subTotal * Number(invoiceDiscountValue || 0)) / 100
        : Number(invoiceDiscountValue || 0);

    const total = subTotal - discount;
    const roundedTotal = Math.round(total);
    const roundOffAmount = roundedTotal - total;

    return {
      subTotal,
      discount,
      total,
      roundOffAmount,
      finalTotal: total + roundOffAmount,
    };
  }, [addedBillingItems, invoiceDiscountType, invoiceDiscountValue]);

  useEffect(() => {
    if (
      Number(form.getValues("invoice.total") || 0) !== invoiceSummary.finalTotal
    ) {
      form.setValue("invoice.total", invoiceSummary.finalTotal as any);
    }
  }, [form, invoiceSummary.finalTotal]);

  return (
    <CustomLayout
      title="Billing Items"
      contentClassName="grid grid-cols-1 md:grid-cols-2 space-x-2"
    >
      <>
        <FormField
          control={billingItemForm.control}
          label="Date"
          name="createdAt"
          type="date"
          required
        />

        <FormInfiniteSelect<
          BillingSection,
          PaginatedResponse<BillingSection>,
          string,
          billingItemValidatorType
        >
          control={billingItemForm.control}
          label="Billing Section"
          name="billingSection"
          query={billingItemQuery}
          getItems={(p) => p?.data}
          valueKey={(i) => String(i?.id)}
          labelKey={(i) => i?.name}
          placeholder="billing section"
          search={billingItemSearch}
          onSearchChange={setBillingItemSearch}
          required
        />
        <div className="md:col-span-2">
          <FormInfiniteSelect<
            ServiceDataType,
            PaginatedResponse<ServiceDataType>,
            string,
            billingItemValidatorType
          >
            control={billingItemForm.control}
            label="Service"
            name="service"
            query={servicesQuery}
            getItems={(p) => p?.data}
            valueKey={(i) => String(i?.id)}
            labelKey={(i) => i?.name}
            placeholder="Select Services"
            search={serviceSearch}
            onSearchChange={setServiceSearch}
            required
          />
        </div>
        <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-5 space-x-2">
          <FormField
            control={billingItemForm.control}
            label="Qty"
            name="quantity"
            type="number"
            required
          />
          <FormField
            control={billingItemForm.control}
            label="Rate"
            name="rate"
            type="number"
            required
            disabled={!canEditRate}
          />
          <FormField
            control={billingItemForm.control}
            label="Discount Type"
            name="discountType"
            type="select"
            options={getDiscountTypeOptions()}
            required
          />
          <FormField
            control={billingItemForm.control}
            label="Discount Value"
            name="discountValue"
            type="number"
            required
          />
          <FormField
            control={billingItemForm.control}
            label="Total"
            name="total"
            type="number"
            required
            readOnly
          />
        </div>
        <div className="md:col-span-2 space-x-2">
          <div className="w-full flex justify-end">
            <CustomButton onClick={handleAddUpdate} className="self-end">
              {typeof editingIndex === "number" ? "Update" : "Add"}
            </CustomButton>
          </div>
        </div>
      </>
      <div className="md:col-span-2 py-2">
        <CustomTable
          data={addedBillingItems}
          columns={columns}
          // enableGrouping
          // grouping={["billingSectionName"]}
          getRowId={(row) => row.index as string}
        />
      </div>
      <div className="md:col-span-2 flex justify-end">
        <div className="w-full max-w-md bg-white border rounded-md p-2 text-tiny">
          <div className="grid grid-cols-[1fr_170px] gap-1 items-center">
            <div className="text-right font-semibold">Invoice Total:</div>
            <div className="text-right">
              {invoiceSummary.subTotal.toFixed(2)}
            </div>

            <div className="text-right font-semibold">Discount:</div>
            <div className="grid grid-cols-[80px_1fr] gap-2">
              <FormField<opdValidatorType>
                name="invoice.discountType"
                control={form.control}
                type="select"
                options={[
                  { value: DiscountType["VALUE"], label: "Rs." },
                  { value: DiscountType["PERCENTAGE"], label: "%" },
                ]}
                required
              />
              <FormField<opdValidatorType>
                name="invoice.discountValue"
                control={form.control}
                type="number"
                required
              />
            </div>

            <div className="text-right font-semibold">Total:</div>
            <div className="text-right">{invoiceSummary.total.toFixed(2)}</div>

            <div className="text-right font-semibold">Round off Amount:</div>
            <div className="text-right">
              {invoiceSummary.roundOffAmount.toFixed(2)}
            </div>

            <div className="text-right font-semibold">Final Total:</div>
            <div className="text-right font-semibold">
              {invoiceSummary.finalTotal.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
      <div className="md:col-span-2">
        <FormField
          control={form.control}
          label="Remarks"
          name="remarks"
          type="textarea"
        />
      </div>
    </CustomLayout>
  );
};

const Transactions = ({ form }: { form: UseFormReturn<opdValidatorType> }) => {
  const { append, update, remove } = useFieldArray({
    name: "invoice.transactions",
    control: form.control,
  });

  const transactionForm = useForm<transactionValidatorType>({
    resolver: zodResolver(transactionsValidator),
  });

  const addedTransactions = form.watch("invoice.transactions");
  const isPaid = form.watch("invoice.isPaid");
  const editingIndex = transactionForm.watch("index");

  const invoiceTotal = Number(form.watch("invoice.total") || 0);

  useEffect(() => {
    if (isPaid !== "true") return;

    const currentAmount = Number(transactionForm.getValues("amount") || 0);
    if (currentAmount > 0) return;

    transactionForm.setValue("amount", invoiceTotal);
  }, [invoiceTotal, isPaid, transactionForm]);

  const columns: ColumnDefWithClass<transactionValidatorType>[] = [
    {
      accessorKey: "mode",
      header: ({ column }) => {
        return (
          <SortableHeader<transactionValidatorType>
            label="Mode"
            column={column}
          />
        );
      },
      headerClassName: "min-w-15 max-w-20",
      cellClassName: "min-w-15 max-w-20",
    },
    {
      accessorKey: "amount",
      header: ({ column }) => {
        return (
          <SortableHeader<transactionValidatorType>
            label="Amount"
            column={column}
          />
        );
      },
      headerClassName: "min-w-50",
      cellClassName: "min-w-50",
    },
    {
      id: "actions",
      header: () => <p>Action</p>,
      cell: ({ row }) => (
        <Actions
          data={row.original}
          form={transactionForm}
          index={row.index}
          remove={remove}
        />
      ),
      headerClassName: "min-w-20 max-w-30",
      cellClassName: "min-w-20 max-w-30",
    },
  ];

  const handleAddUpdate = () => {
    transactionForm.handleSubmit(() => {
      const values = transactionForm.getValues();

      if (typeof values.index === "number") {
        update(values.index as number, {
          ...values,
        });
      } else {
        append({
          ...values,
        });
      }
      transactionForm.reset({});
    })();
  };

  return (
    <CustomLayout
      title="Payment"
      contentClassName="grid grid-cols-1 md:grid-cols-2 space-x-2"
    >
      <div className="md:col-span-2">
        <FormField<opdValidatorType>
          label="Payment received for this invoice?"
          type="radio"
          name="invoice.isPaid"
          control={form.control}
          options={[
            { value: "true", label: "Yes" },
            { value: "false", label: "No" },
          ]}
          required
        />
        {isPaid === "false" && (
          <FormField<opdValidatorType>
            label="This invoice is 'Free of cost (FOC)'."
            type="checkbox"
            name="invoice.isFree"
            control={form.control}
            required
          />
        )}
      </div>
      {isPaid === "true" && (
        <>
          <div>
            <FormField
              control={transactionForm.control}
              label="Amount"
              name="amount"
              type="number"
              required
            />

            <FormField
              control={transactionForm.control}
              label="Mode"
              name="mode"
              options={Object.values(PaymentMode).map((p) => ({
                value: p,
                label: p,
              }))}
              type="select"
              required
            />

            <FormField
              control={transactionForm.control}
              label="Remarks"
              name="remarks"
              type="textarea"
              required
            />

            <div className="col-span-2 space-x-2">
              <div className="w-full flex justify-end">
                <CustomButton onClick={handleAddUpdate} className="self-end">
                  {typeof editingIndex === "number" ? "Update" : "Add"}
                </CustomButton>
              </div>
            </div>
          </div>
          <div className="py-2">
            <CustomTable
              data={addedTransactions}
              columns={columns}
              // enableGrouping
              // grouping={["billingSectionName"]}
              getRowId={(row) => row.index as string}
            />
          </div>
        </>
      )}
    </CustomLayout>
  );
};

const PatientForm = ({ form }: { form: UseFormReturn<opdValidatorType> }) => {
  const isSettingDobFromAge = useRef(false);
  const prevDob = useRef<Date | undefined>(undefined);

  const dob = form.watch("patient.dob") as unknown;
  const ageYears = form.watch("patient.ageYears" as any) as unknown;
  const parsedAgeYears =
    typeof ageYears === "number" && Number.isFinite(ageYears) ? ageYears : null;
  const isAgeValid = parsedAgeYears !== null && parsedAgeYears >= 0;
  useEffect(() => {
    if (!isAgeValid || parsedAgeYears === null) return;

    isSettingDobFromAge.current = true;
    form.setValue(
      "patient.dob",
      startOfDay(subYears(new Date(), parsedAgeYears)) as any,
    );
    setTimeout(() => {
      isSettingDobFromAge.current = false;
    }, 0);
  }, [form, isAgeValid, parsedAgeYears]);

  useEffect(() => {
    const currentDob = (() => {
      if (!dob) return undefined;
      if (dob instanceof Date) return dob;
      const d = new Date(dob as any);
      return Number.isNaN(d.getTime()) ? undefined : d;
    })();
    const previousDob = prevDob.current;

    if (
      parsedAgeYears !== null &&
      currentDob &&
      previousDob &&
      currentDob.getTime() !== previousDob.getTime() &&
      !isSettingDobFromAge.current
    ) {
      form.setValue("patient.ageYears" as any, undefined);
    }

    prevDob.current = currentDob;
  }, [dob, form, parsedAgeYears]);

  return (
    <CustomLayout
      title="Personal Details"
      contentClassName="grid grid-cols-1 md:grid-cols-2 space-x-2 pb-0"
    >
      <div>
        <FormField<opdValidatorType>
          label="Title"
          name="patient.title"
          control={form.control}
          type="select"
          options={Object.keys(NameTitle).map((t) => ({ label: t, value: t }))}
          required
        />
        <FormField<opdValidatorType>
          label="First Name"
          name="patient.firstName"
          control={form.control}
          type="text"
          required
        />
        <FormField<opdValidatorType>
          label="Last Name"
          name="patient.lastName"
          control={form.control}
          type="text"
          required
        />
        <FormField<opdValidatorType>
          label="Date of Birth"
          name="patient.dob"
          control={form.control}
          type="date"
          required
          disabled={isAgeValid}
        />
        <FormField<any>
          label="Age (years)"
          name="patient.ageYears"
          control={form.control as any}
          type="number"
          rules={{
            min: {
              value: 0,
              message: "Age must be greater than or equal to 0",
            },
          }}
        />
        <FormField<opdValidatorType>
          label="Gender"
          name="patient.gender"
          control={form.control}
          options={Object.keys(Gender).map((g) => ({ value: g, label: g }))}
          type="select"
          required
        />
        <FormField<opdValidatorType>
          label="Relation"
          name="patient.relations.0.type"
          control={form.control}
          options={Object.keys(RelationshipType).map((g) => ({
            value: g,
            label: g,
          }))}
          type="select"
        />
        <FormField<opdValidatorType>
          label="Relative Name"
          name="patient.relations.0.name"
          control={form.control}
          type="text"
        />
        <FormField<opdValidatorType>
          label="Medico Legal (MLC)"
          name="patient.isMlcPatient"
          control={form.control}
          type="checkbox"
        />
        <FormField<opdValidatorType>
          label="Insurance Type"
          name="patient.mlcInsuranceType"
          control={form.control}
          type="select"
          options={Object.values(MlcInsuranceType).map((value) => ({
            label: value,
            value,
          }))}
        />
        <FormField<opdValidatorType>
          label="Policy / Card Number"
          name="patient.mlcPolicyOrCardNumber"
          control={form.control}
          type="text"
        />
      </div>
      <div>
        <FormField<opdValidatorType>
          label="Address Line 1"
          name="patient.addresses.0.addressLineOne"
          control={form.control}
          type="text"
        />

        <LocationCascadeFields
          form={form}
          name="patient.addresses.0.location"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 space-x-2">
          <FormField<opdValidatorType>
            label="Phone"
            name="patient.contacts.0.value"
            control={form.control}
            type="text"
            required
          />

          <FormField<opdValidatorType>
            label="Identity Document Type"
            name="patient.identifications.0.type"
            control={form.control}
            type="select"
            options={Object.values(IdentityType).map((value) => ({
              label: value,
              value,
            }))}
          />

          <FormField<opdValidatorType>
            label="Mobile"
            name="patient.contacts.1.value"
            control={form.control}
            type="text"
          />

          <FormField<opdValidatorType>
            label="Identity Number"
            name="patient.identifications.0.number"
            control={form.control}
            type="text"
          />
          <FormField<opdValidatorType>
            label="Email"
            name="patient.contacts.2.value"
            control={form.control}
            type="text"
          />
        </div>
      </div>
    </CustomLayout>
  );
};

const OpdBillForm = () => {
  const [consultantValue, setConsultantValue] = useState("");
  const [referringValue, setReferringValue] = useState("");
  const [confirmCreateOpen, setConfirmCreateOpen] = useState(false);
  const [pendingSubmission, setPendingSubmission] =
    useState<opdValidatorType | null>(null);
  const [postCreatePrintOpen, setPostCreatePrintOpen] = useState(false);
  const [createdInvoiceId, setCreatedInvoiceId] = useState<number | null>(null);
  const [createdOpdId, setCreatedOpdId] = useState<number | null>(null);

  const router = useRouter();
  const { data: profile } = useProfile(false);
  const { mutateAsync, isPending } = useCreateOpd({
    navigateBackOnSuccess: false,
    onSuccess: (response) => {
      const invoiceId = Number((response.data as any)?.id || 0);
      const opdId = Number((response.data as any)?.opd?.id || 0);

      if (invoiceId) {
        setCreatedInvoiceId(invoiceId);
      }
      if (opdId) {
        setCreatedOpdId(opdId);
      }
      setPostCreatePrintOpen(true);
    },
  });
  const params: { patientId: string } = useParams();
  const { data: patient, isLoading } = useGetPatient(params?.patientId);
  const consultingDoctorQuery = useInfiniteDoctorList(
    {
      doctorType: "consulting",
      name: consultantValue,
      status: Status["active"],
    },
    20,
  );
  const referringDoctorQuery = useInfiniteDoctorList(
    {
      name: referringValue,
      status: Status["active"],
    },
    20,
  );

  const form = useForm<opdValidatorType>({
    defaultValues: getInitialValues(patient),
    resolver: zodResolver(opdValidator),
  });

  const onSubmit = (values: opdValidatorType) => {
    setPendingSubmission(values);
    setConfirmCreateOpen(true);
  };

  const handleConfirmedCreate = async () => {
    if (!pendingSubmission) return;
    await mutateAsync(pendingSubmission);
    setConfirmCreateOpen(false);
    setPendingSubmission(null);
  };

  useEffect(() => {
    if (patient) {
      form.reset(getInitialValues(patient));
    }
  }, [patient, form]);

  if (isLoading && params?.patientId) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon
          role="status"
          aria-label="Loading"
          className="size-4 animate-spin"
        />
      </div>
    );
  }

  if (params?.patientId && !patient) {
    return <div />;
  }

  if (!profile) {
    return <div />;
  }

  const canCreate = hasActionPermission(
    profile.data,
    ModuleType.OPD_BILL,
    ActionType.CREATE,
  );

  if (!canCreate) {
    return (
      <CustomLayout title="OPD Billing">
        <NoPermission />
      </CustomLayout>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CustomLayout
          title="Patient Registration"
          contentClassName="grid grid-cols-1 md:grid-cols-2 pb-0 space-x-2"
        >
          <FormField<opdValidatorType>
            label="Arrival State"
            name="arrivalState"
            control={form.control}
            type="select"
            options={Object.values(OpdArrival).map((a) => ({
              label: a,
              value: a,
            }))}
            required
          />
        </CustomLayout>
        <PatientForm form={form} />
        <CustomLayout
          title="Billing"
          contentClassName="grid grid-cols-1 md:grid-cols-2 pb-0 space-x-2"
        >
          <FormField<opdValidatorType>
            label="Billing Date"
            name="invoice.createdAt"
            control={form.control}
            type="date"
            required
          />
          <FormField<opdValidatorType>
            label="Billing Type"
            name="invoice.billingType"
            control={form.control}
            type="select"
            options={Object.values(PaymentCategory).map((p) => ({
              label: p,
              value: p,
            }))}
            required
          />
          <div className="flex items-end gap-1">
            <div className="flex-1">
              <FormInfiniteSelect<
                Doctor,
                PaginatedResponse<Doctor>,
                string,
                opdValidatorType
              >
                label="Consultant"
                name="consultantDoctor"
                control={form.control}
                placeholder="Consultant Doctor"
                query={consultingDoctorQuery}
                getItems={(data) => data?.data}
                labelKey={(item: Doctor) => fullName(item)}
                valueKey={(item: Doctor) => String(item?.id)}
                search={consultantValue}
                onSearchChange={setConsultantValue}
                required
              />
            </div>
            <QuickCreateDoctorModal
              doctorType={DoctorType.consulting}
              onSuccess={(newDoc) => {
                form.setValue("consultantDoctor", newDoc);
                consultingDoctorQuery.refetch();
              }}
            />
          </div>

          <div className="flex items-end gap-1">
            <div className="flex-1">
              <FormInfiniteSelect<
                Doctor,
                PaginatedResponse<Doctor>,
                string,
                opdValidatorType
              >
                label="Referred By"
                name="referredDoctor"
                placeholder="Referring Doctor"
                control={form.control}
                query={referringDoctorQuery}
                getItems={(data) => data?.data}
                labelKey={(item: Doctor) => fullName(item)}
                valueKey={(item: Doctor) => String(item?.id)}
                search={referringValue}
                onSearchChange={setReferringValue}
              />
            </div>
            <QuickCreateDoctorModal
              doctorType={DoctorType.referring}
              onSuccess={(newDoc) => {
                form.setValue("referredDoctor", newDoc);
                referringDoctorQuery.refetch();
              }}
            />
          </div>
        </CustomLayout>
        <BillingItems form={form} />

        <Transactions form={form} />

        <ErrorMessage
          errors={form.formState.errors}
          name="invoice"
          render={({ message }) => (
            <p className="text-red-500 text-sm mt-1">{message}</p>
          )}
        />
        <CustomButton disabled={isPending} type="submit">
          Submit
        </CustomButton>
      </form>
      <CustomAlert
        open={confirmCreateOpen}
        onOpenChange={setConfirmCreateOpen}
        triggerButton={<div />}
        title="Create OPD?"
        description="Do you want to create this OPD now?"
        cancelText="Cancel"
        confirmText="Create"
        iconType="confirm"
        confirmVariant="default"
        pending={isPending}
        handleConfirm={handleConfirmedCreate}
      />
      <PostCreatePrintDialog
        open={postCreatePrintOpen}
        onOpenChange={(open) => {
          setPostCreatePrintOpen(open);
          if (!open) {
            router.push("/opd/patients");
          }
        }}
        invoiceId={createdInvoiceId}
        opdId={createdOpdId}
        onDone={() => {
          setPostCreatePrintOpen(false);
          router.push("/opd/patients");
        }}
      />
    </Form>
  );
};

export default OpdBillForm;
