"use client";

import { CustomAlert } from "@/components/common/CustomAlert";
import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import { SortableHeader } from "@/components/common/SortableHeader";
import FormField from "@/components/form-inputs/FormField";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  BloodGroup,
  DiscountType,
  Gender,
  MaritalStatus,
  OpdArrival,
  PaymentCategory,
  PaymentMode,
} from "@/generated/prisma/enums";
import { useInfiniteBillingSectionsList } from "@/hooks/query/bllingSection";
import { useInfiniteDoctorList } from "@/hooks/query/doctor";
import { useCreateOpd } from "@/hooks/query/opd";
import { useGetPatient } from "@/hooks/query/patient";
import { useInfiniteServicesList } from "@/hooks/query/service";
import { ColumnDefWithClass, PatientType } from "@/lib/type";
import {
  billingItemValidator,
  billingItemValidatorType,
  opdValidator,
  opdValidatorType,
  transactionsValidator,
  transactionValidatorType,
} from "@/validators/api/opd/opd";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Edit2, LoaderIcon, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  useFieldArray,
  UseFieldArrayRemove,
  useForm,
  UseFormReturn,
} from "react-hook-form";

const getInitialValues = (data?: PatientType): opdValidatorType => ({
  patientId: data?.id ?? undefined,
  patient: {
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
    addresses: data?.addresses ?? [],
    contacts: data?.contacts ?? [],
    relations: data?.relations ?? [],
    identifications: data?.identifications ?? [],
    emergencyContacts: data?.emergencyContacts ?? [],
    notes: data?.notes ?? [],
  },
  arrivalState: OpdArrival.ROUTINE,
  isPaid: false,
  isFree: false,
  transactions: [],
  discountType: "VALUE",
  discountValue: 0,
  rate: 0,
  remarks: "",
  total: 0,
  billingItem: [],
  consultantDoctorId: undefined,
  billingType: PaymentCategory["SELF_PAY"],
});

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
    name: "billingItem",
    control: form.control,
  });

  const billingItemForm = useForm<billingItemValidatorType>({
    resolver: zodResolver(billingItemValidator),
  });

  const billingSectionId = billingItemForm.watch("billingSectionId");
  const serviceId = billingItemForm.watch("serviceId");
  const quantity = billingItemForm.watch("quantity");
  const rate = billingItemForm.watch("rate");
  const discountValue = billingItemForm.watch("discountValue");
  const discountType = billingItemForm.watch("discountType");
  const addedBillingItems = form.watch("billingItem");
  const editingIndex = billingItemForm.watch("index");

  const {
    data: billingItems,
    isFetchingNextPage: isFetchingNextPageBillingItems,
    hasNextPage: hasNextPageBillingItems,
    fetchNextPage: fetchNextPageBillingItems,
  } = useInfiniteBillingSectionsList({ name: billingItemSearch }, 10);

  const {
    data: services,
    isFetchingNextPage: isFetchingNextPageServices,
    hasNextPage: hasNextPageServices,
    fetchNextPage: fetchNextPageServices,
  } = useInfiniteServicesList(
    { name: serviceSearch, billingSectionId: billingSectionId as string },
    10,
  );

  const flatBillingItems = useMemo(
    () =>
      billingItems?.pages.flatMap((p) =>
        p.data.flatMap((f) => ({ label: f.name, value: f.id })),
      ),
    [billingItems],
  );

  const flatServices = useMemo(
    () =>
      services?.pages.flatMap((p) =>
        p.data.flatMap((f) => ({ ...f, label: f.name, value: f.id })),
      ),
    [services],
  );

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
      const service = flatServices?.find((s) => s.id === values.serviceId);
      const billingItem = flatBillingItems?.find(
        (s) => s.value === values.serviceId,
      );

      if (typeof values.index === "number") {
        update(values.index as number, {
          ...values,
          serviceName: service?.name || "",
          billingSectionName: billingItem?.label || "",
        });
      } else {
        append({
          ...values,
          serviceName: service?.name || "",
          billingSectionName: billingItem?.label || "",
        });
      }
      billingItemForm.reset({});
    })();
  };

  useEffect(() => {
    if (serviceId) {
      const service = flatServices?.find((s) => s.id === serviceId);
      if (!service) {
        billingItemForm.setValue("rate", 0);
        billingItemForm.setValue("discountValue", 0);
        billingItemForm.setValue("discountType", DiscountType["VALUE"]);
        billingItemForm.setValue("total", 0);
        billingItemForm.setValue("maxDiscount", 0);
        billingItemForm.setValue("quantity", 0);
      } else {
        billingItemForm.setValue("rate", service.price);
        billingItemForm.setValue("discountValue", 0);
        billingItemForm.setValue("discountType", DiscountType["VALUE"]);
        billingItemForm.setValue("total", service.price);
        billingItemForm.setValue("quantity", 1);
        billingItemForm.setValue("maxDiscount", service.maxDiscount);
      }
    } else {
      billingItemForm.setValue("rate", 0);
      billingItemForm.setValue("discountValue", 0);
      billingItemForm.setValue("discountType", DiscountType["VALUE"]);
      billingItemForm.setValue("total", 0);
      billingItemForm.setValue("quantity", 0);
      billingItemForm.setValue("maxDiscount", 0);
    }
  }, [serviceId, billingItemForm, flatServices]);

  useEffect(() => {
    if (serviceId) {
      const gross = Number(quantity) * Number(rate);
      const total =
        discountType === "PERCENTAGE"
          ? (gross * Number(discountValue)) / 100
          : gross - Number(discountValue);
      billingItemForm.setValue("total", total);
    } else {
      billingItemForm.setValue("quantity", 0);
    }
  }, [quantity, serviceId, billingItemForm, rate, discountType, discountValue]);

  return (
    <CustomLayout
      title="Billing Items"
      contentClassName="grid grid-cols-2 space-x-2"
    >
      <>
        <FormField
          control={billingItemForm.control}
          label="Date"
          name="createdAt"
          type="date"
          required
        />

        <FormField
          control={billingItemForm.control}
          label="Billing Section"
          name="billingSectionId"
          type="infiniteSelect"
          fetchNextPage={fetchNextPageBillingItems}
          hasNextPage={hasNextPageBillingItems}
          isFetchingNextPage={isFetchingNextPageBillingItems}
          options={flatBillingItems || []}
          onSearch={setBillingItemSearch}
          required
        />
        <div className="col-span-2">
          <FormField
            control={billingItemForm.control}
            label="Service"
            name="serviceId"
            type="infiniteSelect"
            fetchNextPage={fetchNextPageServices}
            hasNextPage={hasNextPageServices}
            isFetchingNextPage={isFetchingNextPageServices}
            options={flatServices || []}
            onSearch={setServiceSearch}
            required
          />
        </div>
        <div className="col-span-2 grid grid-cols-5 space-x-2">
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
          />
          <FormField
            control={billingItemForm.control}
            label="Discount Type"
            name="discountType"
            type="select"
            options={Object.values(DiscountType).map((d) => ({
              value: d,
              label: d,
            }))}
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
        <div className="col-span-2 space-x-2">
          <div className="w-full flex justify-end">
            <CustomButton onClick={handleAddUpdate} className="self-end">
              {typeof editingIndex === "number" ? "Update" : "Add"}
            </CustomButton>
          </div>
        </div>
      </>
      <div className="col-span-2 py-2">
        <CustomTable
          data={addedBillingItems}
          columns={columns}
          enableGrouping
          grouping={["billingSectionName"]}
          getRowId={(row) => row.index as string}
        />
      </div>
      <div className="col-span-2">
        <FormField
          control={form.control}
          label="Remarks"
          name="remarks"
          type="textarea"
          required
        />
      </div>
    </CustomLayout>
  );
};

const Transactions = ({ form }: { form: UseFormReturn<opdValidatorType> }) => {
  const { append, update, remove } = useFieldArray({
    name: "transactions",
    control: form.control,
  });

  const transactionForm = useForm<transactionValidatorType>({
    resolver: zodResolver(transactionsValidator),
  });

  const addedTransactions = form.watch("transactions");
  const isPaid = form.watch("isPaid");
  const editingIndex = transactionForm.watch("index");

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
    <CustomLayout title="Payment" contentClassName="grid grid-cols-2 space-x-2">
      <div className="col-span-2">
        <FormField<opdValidatorType>
          label="Payment received for this invoice?"
          type="radio"
          name="isPaid"
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
            name="isFree"
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
              enableGrouping
              grouping={["billingSectionName"]}
              getRowId={(row) => row.index as string}
            />
          </div>
        </>
      )}
    </CustomLayout>
  );
};

const OpdBillForm = () => {
  const [consultantValue, setConsultantValue] = useState("");
  const [referringValue, setReferringValue] = useState("");

  const { mutateAsync, isPending } = useCreateOpd();
  const params: { patientId: string } = useParams();
  const { data: patient, isLoading } = useGetPatient(params?.patientId);
  const {
    data: consultingDoctors,
    isFetchingNextPage: isFetchingNextPageConsulting,
    hasNextPage: hasNextPageConsulting,
    fetchNextPage: fetchNextPageConsulting,
  } = useInfiniteDoctorList(
    {
      doctorType: "consulting",
      name: consultantValue,
    },
    10,
  );
  const {
    data: referringDoctors,
    isFetchingNextPage: isFetchingNextPageReferring,
    hasNextPage: hasNextPageReferring,
    fetchNextPage: fetchNextPageReferring,
  } = useInfiniteDoctorList(
    {
      name: referringValue,
    },
    10,
  );

  const flatConsultingDoctors = useMemo(
    () =>
      consultingDoctors?.pages.flatMap((p) =>
        p.data.flatMap((f) => ({ label: f.user.name, value: f.userId })),
      ),
    [consultingDoctors],
  );

  const flatReferringDoctors = useMemo(
    () =>
      referringDoctors?.pages.flatMap((p) =>
        p.data.flatMap((f) => ({ label: f.user.name, value: f.userId })),
      ),
    [referringDoctors],
  );

  const form = useForm<opdValidatorType>({
    defaultValues: getInitialValues(patient),
    resolver: zodResolver(opdValidator),
  });

  const onSubmit = (values: opdValidatorType) => {
    mutateAsync(values);
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
    return <></>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CustomLayout
          title="Patient Registration"
          contentClassName="grid grid-cols-2 pb-0 space-x-2"
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
        <CustomLayout
          title="Personal Details"
          contentClassName="grid grid-cols-2 space-x-2 pb-0"
        >
          <FormField<opdValidatorType>
            label="First Name"
            name="patient.firstName"
            control={form.control}
            type="text"
            readOnly
            required
          />
          <FormField<opdValidatorType>
            label="Last Name"
            name="patient.lastName"
            control={form.control}
            type="text"
            readOnly
            required
          />
          <FormField<opdValidatorType>
            label="Date of Birth"
            name="patient.dob"
            control={form.control}
            type="text"
            readOnly
            required
          />

          <FormField<opdValidatorType>
            label="Gender"
            name="patient.gender"
            control={form.control}
            type="text"
            readOnly
            required
          />
        </CustomLayout>
        <CustomLayout
          title="Billing"
          contentClassName="grid grid-cols-2 pb-0 space-x-2"
        >
          <FormField<opdValidatorType>
            label="Billing Date"
            name="createdAt"
            control={form.control}
            type="date"
            required
          />
          <FormField<opdValidatorType>
            label="Billing Type"
            name="billingType"
            control={form.control}
            type="select"
            options={Object.values(PaymentCategory).map((p) => ({
              label: p,
              value: p,
            }))}
            required
          />
          <FormField<opdValidatorType>
            label="Consultant"
            type="infiniteSelect"
            name="consultantDoctorId"
            control={form.control}
            options={flatConsultingDoctors || []}
            fetchNextPage={fetchNextPageConsulting}
            hasNextPage={hasNextPageConsulting}
            isFetchingNextPage={isFetchingNextPageConsulting}
            onSearch={setConsultantValue}
            required
          />
          <FormField<opdValidatorType>
            label="Referred By"
            type="infiniteSelect"
            name="referredDoctorId"
            control={form.control}
            options={flatReferringDoctors || []}
            fetchNextPage={fetchNextPageReferring}
            hasNextPage={hasNextPageReferring}
            isFetchingNextPage={isFetchingNextPageReferring}
            onSearch={setReferringValue}
            required
          />
        </CustomLayout>
        <BillingItems form={form} />

        <Transactions form={form} />

        <CustomButton disabled={isPending} type="submit">
          Submit
        </CustomButton>
      </form>
    </Form>
  );
};

export default OpdBillForm;
