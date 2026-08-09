"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import FormField from "@/components/form-inputs/FormField";
import CreatePharmacyCustomerModal from "@/components/pharmacy/sale-bill/CreatePharmacyCustomerModal";
import PharmacySummaryRow from "@/components/pharmacy/PharmacySummaryRow";
import SaleBillItemsTable from "@/components/pharmacy/sale-bill/SaleBillItemsTable";
import SelectHospitalPatientModal from "@/components/pharmacy/sale-bill/SelectHospitalPatientModal";
import StoreDirectoryModal from "@/components/pharmacy/sale-bill/StoreDirectoryModal";
import {
  SaleBillFormValues,
  SaleBillInventoryItem,
} from "@/components/pharmacy/sale-bill/types";
import { Form } from "@/components/ui/form";
import {
  ActionType,
  DiscountType,
  ModuleType,
  PaymentCategory,
  PaymentMode,
  Status,
} from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useInfiniteDoctorList } from "@/hooks/query/doctor";
import { useInfinitePharmacyCustomers } from "@/hooks/query/pharmacyCustomer";
import {
  useCreateSaleBill,
  useGetSaleBill,
  useUpdateSaleBill,
} from "@/hooks/query/pharmacySaleBill";
import {
  Doctor,
  FilterValues,
  PaginatedResponse,
  PatientType,
  PharmacySaleBillType,
  PharmacyCustomerType,
} from "@/lib/type";
import { fullName, hasActionPermission } from "@/lib/utils";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

type SaleBillData = PharmacySaleBillType;

const toValidDate = (value: unknown) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
};

const emptyItem = () => ({
  inventoryItem: null,
  quantity: 1,
  isLooseQuantity: false,
  rate: 0,
  discountType: DiscountType.VALUE,
  discountValue: 0,
  taxableAmount: 0,
  gstAmount: 0,
  cGstAmount: 0,
  sGstAmount: 0,
  iGstAmount: 0,
  total: 0,
});

const getPatientDisplayName = (patient?: PatientType | null) =>
  patient
    ? [`${patient.title}.`, patient.firstName, patient.lastName].join(" ")
    : "";

const money = (value: number) => Number(value || 0).toFixed(2);

const getInitialValues = (data?: SaleBillData): SaleBillFormValues => {
  if (!data) {
    return {
      billDate: new Date(),
      customer: null,
      patient: null,
      doctor: null,
      isWholesaleBill: false,
      isLooseBill: false,
      billingType: PaymentCategory.SELF_PAY,
      discountType: DiscountType.VALUE,
      discountValue: 0,
      isFree: false,
      items: [emptyItem()],
      paymentAmount: 0,
      paymentMode: PaymentMode.CASH,
      paymentRemarks: "",
    };
  }

  const firstTransaction = data.invoice?.transactions?.[0];
  const transactionTotal = (data.invoice?.transactions || []).reduce(
    (sum, txn) => sum + Number(txn.amount || 0),
    0,
  );
  const outstandingDue = Math.max(
    Number(data.invoice?.total || 0) - transactionTotal,
    0,
  );

  return {
    billDate: toValidDate(data.invoice?.createdAt),
    customer: data.customer ?? null,
    patient: (data.patient as unknown as PatientType) ?? null,
    doctor: (data.doctor as unknown as Doctor) ?? null,
    isWholesaleBill: Boolean(data.isWholesaleBill),
    isLooseBill: Boolean(data.isLooseBill),
    billingType: data.invoice?.billingType ?? PaymentCategory.SELF_PAY,
    discountType: data.invoice?.discountType ?? DiscountType.VALUE,
    discountValue: Number(data.invoice?.discountValue || 0),
    isFree: Boolean(data.invoice?.isFree),
    items: data.saleItems?.map((item) => ({
      inventoryItem: item.inventoryItem as SaleBillInventoryItem,
      quantity: Number(item.quantity),
      isLooseQuantity: Boolean(item.isLooseQuantity),
      rate: Number(item.rate),
      discountType: item.discountType,
      discountValue: Number(item.discountValue || 0),
      taxableAmount: Number(item.taxableAmount || 0),
      gstAmount: Number(item.gstAmount || 0),
      cGstAmount: Number(item.cGstAmount || 0),
      sGstAmount: Number(item.sGstAmount || 0),
      iGstAmount: Number(item.iGstAmount || 0),
      total: Number(item.total || 0),
    })) ?? [emptyItem()],
    paymentAmount: outstandingDue,
    paymentMode: firstTransaction?.mode ?? PaymentMode.CASH,
    paymentRemarks: firstTransaction?.remarks ?? "",
  };
};

const UpdateCreateForm = ({ data }: { data?: SaleBillData }) => {
  const [doctorSearch, setDoctorSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [storeDirectoryOpen, setStoreDirectoryOpen] = useState(false);
  const { mutateAsync: create, isPending: creating } = useCreateSaleBill();
  const { mutateAsync: update, isPending: updating } = useUpdateSaleBill();
  const params: { billId: string } = useParams();

  const doctorQuery = useInfiniteDoctorList(
    { name: doctorSearch, status: Status.active },
    20,
  );
  const customerQuery = useInfinitePharmacyCustomers(
    { name: customerSearch } as FilterValues,
    20,
  );

  const form = useForm<SaleBillFormValues>({
    defaultValues: getInitialValues(data),
  });

  useEffect(() => {
    form.reset(getInitialValues(data));
  }, [data, form]);

  const items = useWatch({
    control: form.control,
    name: "items",
  });
  const isWholesaleBill = Boolean(
    useWatch({
      control: form.control,
      name: "isWholesaleBill",
    }),
  );
  const isLooseBill = Boolean(
    useWatch({
      control: form.control,
      name: "isLooseBill",
    }),
  );
  const selectedPatient = useWatch({
    control: form.control,
    name: "patient",
  }) as PatientType | null | undefined;
  const paymentAmount = Number(
    useWatch({
      control: form.control,
      name: "paymentAmount",
    }) || 0,
  );
  const existingPaidAmount = useMemo(
    () =>
      Number(
        (data?.invoice?.transactions || []).reduce(
          (sum, txn) => sum + Number(txn.amount || 0),
          0,
        ),
      ),
    [data?.invoice?.transactions],
  );

  const subtotal = useMemo(
    () => (items || []).reduce((sum, item) => sum + Number(item.total || 0), 0),
    [items],
  );
  const totalDiscount = useMemo(
    () =>
      (items || []).reduce(
        (sum, item) => sum + Number(item.discountValue || 0),
        0,
      ),
    [items],
  );
  const totalTax = useMemo(
    () =>
      (items || []).reduce((sum, item) => sum + Number(item.gstAmount || 0), 0),
    [items],
  );
  const effectivePaidAmount = params?.billId
    ? existingPaidAmount + paymentAmount
    : paymentAmount;
  const dueAmount = Math.max(subtotal - effectivePaidAmount, 0);

  useEffect(() => {
    const paymentState = form.getFieldState("paymentAmount");
    const autoPaymentAmount = params?.billId
      ? Math.max(subtotal - existingPaidAmount, 0)
      : subtotal;

    if (!paymentState.isDirty) {
      form.setValue("paymentAmount", autoPaymentAmount, {
        shouldDirty: false,
        shouldTouch: false,
      });
    }
  }, [existingPaidAmount, form, params?.billId, subtotal]);

  const onSubmit = async (values: SaleBillFormValues) => {
    const validItems = values.items.filter((item) => item.inventoryItem?.id);
    if (!validItems.length) {
      toast.error("Add at least one drug item");
      return;
    }

    const hasOverStock = validItems.some((item) => {
      const packSize = Math.max(
        Number(item.inventoryItem?.itemsPerPack || 1),
        1,
      );
      const requestedPieces = Boolean(item.isLooseQuantity)
        ? Number(item.quantity || 0)
        : Number(item.quantity || 0) * packSize;

      return requestedPieces > Number(item.inventoryItem?.quantityInStock || 0);
    });
    if (hasOverStock) {
      toast.error("One or more rows exceed available stock");
      return;
    }

    const selectedCustomerName =
      values.customer?.name ||
      (values.patient
        ? `${values.patient.firstName} ${values.patient.lastName}`
        : "Walk-in Customer");

    const payload = {
      name: selectedCustomerName,
      customerId: values.customer?.id ? Number(values.customer.id) : undefined,
      patientId: values.patient?.id ? Number(values.patient.id) : undefined,
      doctorId: values.doctor?.id ? Number(values.doctor.id) : undefined,
      isWholesaleBill: Boolean(values.isWholesaleBill),
      isLooseBill: Boolean(values.isLooseBill),
      billingType: values.billingType,
      discountType: values.discountType,
      discountValue: Number(values.discountValue || 0),
      isFree: false,
      createdAt: toValidDate(values.billDate),
      items: validItems.map((item) => ({
        inventoryItem: { id: Number(item.inventoryItem?.id) },
        quantity: Number(item.quantity),
        isLooseQuantity: Boolean(item.isLooseQuantity),
        rate: Number(item.rate || 0),
        discountType: item.discountType,
        discountValue: Number(item.discountValue || 0),
        total: Number(item.total || 0),
      })),
      transactions: Number(
        params?.billId
          ? existingPaidAmount + Number(values.paymentAmount || 0)
          : Number(values.paymentAmount || 0),
      )
        ? [
            {
              amount: Number(
                params?.billId
                  ? existingPaidAmount + Number(values.paymentAmount || 0)
                  : Number(values.paymentAmount || 0),
              ),
              mode: values.paymentMode,
              remarks: values.paymentRemarks || undefined,
            },
          ]
        : [],
    };

    if (params?.billId) {
      await update({
        billId: Number(params.billId),
        ...payload,
      });
      return;
    }

    await create(payload);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <FormField<SaleBillFormValues>
                  label="Bill Date"
                  type="date"
                  name="billDate"
                  control={form.control}
                  required
                />
              </div>
              <div>
                <FormInfiniteSelect<
                  PharmacyCustomerType,
                  PaginatedResponse<PharmacyCustomerType>,
                  string,
                  SaleBillFormValues
                >
                  label="Customer Name"
                  name="customer"
                  control={form.control}
                  query={customerQuery}
                  getItems={(page) => page?.data}
                  valueKey={(item) => String(item.id)}
                  labelKey={(item) =>
                    [
                      item.name,
                      item.contact || "No contact",
                      item.gstNumber || "No GST",
                    ].join(" | ")
                  }
                  search={customerSearch}
                  onSearchChange={setCustomerSearch}
                  placeholder="Select customer"
                />
                <div className="-mt-1">
                  <CustomButton
                    type="button"
                    onClick={() => setCustomerModalOpen(true)}
                  >
                    Add Customer
                  </CustomButton>
                </div>
              </div>
              <div>
                <FormInfiniteSelect<
                  Doctor,
                  PaginatedResponse<Doctor>,
                  string,
                  SaleBillFormValues
                >
                  label="Doctor"
                  name="doctor"
                  control={form.control}
                  query={doctorQuery}
                  getItems={(page) => page?.data}
                  valueKey={(item) => String(item.id)}
                  labelKey={(item) => fullName(item as Doctor)}
                  search={doctorSearch}
                  onSearchChange={setDoctorSearch}
                  placeholder="Select doctor"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-2 rounded-sm border border-black/20 bg-background/40 px-3 py-2">
              <div className="space-y-1">
                <div className="text-tiny font-semibold">Hospital Patient</div>
                <CustomButton
                  type="button"
                  variant="secondary"
                  onClick={() => setPatientModalOpen(true)}
                >
                  Select Hospital Patient
                </CustomButton>
              </div>
              {selectedPatient && (
                <>
                  <div className="min-w-[320px] flex-1 rounded border border-black/15 bg-white px-2 py-2 text-tiny">
                    {`${selectedPatient.id} | ${getPatientDisplayName(selectedPatient)}`}
                  </div>
                  <CustomButton
                    type="button"
                    variant="outline"
                    className="bg-white text-black"
                    onClick={() =>
                      form.setValue("patient", null, { shouldDirty: true })
                    }
                  >
                    Clear
                  </CustomButton>
                </>
              )}
            </div>

            <div className="w-full flex justify-between items-center">
              <div className="flex items-center gap-6">
                <FormField<SaleBillFormValues>
                  label="Wholesale Bill"
                  type="checkbox"
                  name="isWholesaleBill"
                  control={form.control}
                />
                <FormField<SaleBillFormValues>
                  label="Loose Bill"
                  type="checkbox"
                  name="isLooseBill"
                  control={form.control}
                />
              </div>
              <CustomButton
                type="button"
                variant="secondary"
                onClick={() => setStoreDirectoryOpen(true)}
              >
                Store Directory
              </CustomButton>
            </div>
            <SaleBillItemsTable
              form={form}
              isWholesaleBill={isWholesaleBill}
              isLooseBill={isLooseBill}
            />

            <div className="grid gap-3 lg:grid-cols-[1fr_260px_260px]">
              <div />

              <div className="overflow-hidden rounded-sm border border-black/20 bg-background/50">
                <PharmacySummaryRow
                  label="Discount"
                  value={money(totalDiscount)}
                />
                <PharmacySummaryRow label="Tax" value={money(totalTax)} />
                <PharmacySummaryRow label="Total" value={money(subtotal)} />
                <PharmacySummaryRow
                  label="Paid"
                  value={money(effectivePaidAmount)}
                />
                <PharmacySummaryRow label="Due" value={money(dueAmount)} />
              </div>

              <div className="overflow-hidden rounded-sm border border-black/20 bg-background/50">
                <PharmacySummaryRow
                  label="Amount"
                  value={
                    <FormField<SaleBillFormValues>
                      type="number"
                      name="paymentAmount"
                      control={form.control}
                      className="h-7 border-0 px-0 text-right shadow-none focus-visible:ring-0"
                    />
                  }
                />
                <PharmacySummaryRow
                  label="Mode"
                  value={
                    <FormField<SaleBillFormValues>
                      type="select"
                      name="paymentMode"
                      control={form.control}
                      options={Object.values(PaymentMode).map((mode) => ({
                        label: mode,
                        value: mode,
                      }))}
                      className="h-7 border-0 px-0 text-right shadow-none focus-visible:ring-0"
                    />
                  }
                />
                <PharmacySummaryRow
                  label="Remarks"
                  value={
                    <FormField<SaleBillFormValues>
                      type="text"
                      name="paymentRemarks"
                      control={form.control}
                      className="h-7 border-0 px-0 text-right shadow-none focus-visible:ring-0"
                    />
                  }
                />
              </div>
            </div>

            <div className="flex justify-end">
              <CustomButton disabled={creating || updating} type="submit">
                {params?.billId
                  ? "Update Sale Bill"
                  : "Payment & Save Sale Bill"}
              </CustomButton>
            </div>
          </div>
        </form>
      </Form>

      <CreatePharmacyCustomerModal
        open={customerModalOpen}
        onOpenChange={setCustomerModalOpen}
        selectedPatient={selectedPatient}
        onCreated={(customer) => {
          form.setValue("customer", customer, { shouldDirty: true });
        }}
      />

      <SelectHospitalPatientModal
        open={patientModalOpen}
        onOpenChange={setPatientModalOpen}
        onSelect={(patient) => {
          form.setValue("patient", patient, { shouldDirty: true });
        }}
      />

      <StoreDirectoryModal
        open={storeDirectoryOpen}
        onOpenChange={setStoreDirectoryOpen}
      />
    </>
  );
};

const SaleBillForm = () => {
  const params: { billId: string } = useParams();
  const { data: profile } = useProfile(false);
  const { data, isLoading } = useGetSaleBill(params?.billId);

  if (isLoading && params?.billId) {
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

  if (params?.billId && !data) {
    return <div />;
  }

  if (!profile) {
    return <div />;
  }

  const canCreate = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_SALE_BILL,
    ActionType.CREATE,
  );
  const canUpdate = hasActionPermission(
    profile.data,
    ModuleType.PHARMACY_SALE_BILL,
    ActionType.UPDATE,
  );

  if ((params?.billId && !canUpdate) || (!params?.billId && !canCreate)) {
    return (
      <CustomLayout title="Sale">
        <NoPermission />
      </CustomLayout>
    );
  }

  return (
    <CustomLayout title="Customer Sale">
      <UpdateCreateForm data={data} />
    </CustomLayout>
  );
};

export default SaleBillForm;
