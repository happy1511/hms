"use client";

import { CustomAlert } from "@/components/common/CustomAlert";
import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import { SortableHeader } from "@/components/common/SortableHeader";
import FormField from "@/components/form-inputs/FormField";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { BillingSection, Location } from "@/generated/prisma/client";
import {
  AddressType,
  BloodGroup,
  ContactType,
  DiscountType,
  Gender,
  IdentityType,
  MaritalStatus,
  NameTitle,
  OpdArrival,
  PaymentCategory,
  PaymentMode,
  RelationshipType,
  Status,
} from "@/generated/prisma/enums";
import { useInfiniteBillingSectionsList } from "@/hooks/query/bllingSection";
import { useInfiniteDoctorList } from "@/hooks/query/doctor";
import { useInfiniteLocationsList } from "@/hooks/query/locations";
import { useCreateOpd } from "@/hooks/query/opd";
import { useGetPatient } from "@/hooks/query/patient";
import { useInfiniteServicesList } from "@/hooks/query/service";
import {
  ColumnDefWithClass,
  Doctor,
  PaginatedResponse,
  PatientType,
  ServiceDataType,
} from "@/lib/type";
import {
  billingItemValidator,
  billingItemValidatorType,
  transactionsValidator,
  transactionValidatorType,
} from "@/validators/api/invoice/invoice";
import { PatientAddressValidatorType } from "@/validators/api/masters/patient";
import { opdValidator, opdValidatorType } from "@/validators/api/opd/opd";
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

  // ---------------- IDENTIFICATION MAP (only AADHAR + VOTER) ----------------
  const idMap = {
    [IdentityType.ADHAR_CARD]: "",
    [IdentityType.VOTER_CARD]: "",
    [IdentityType.DRIVING_LICENSE]: "",
  };

  data?.identifications?.forEach((id) => {
    if (
      id.type === IdentityType.ADHAR_CARD ||
      id.type === IdentityType.VOTER_CARD ||
      id.type === IdentityType.DRIVING_LICENSE
    ) {
      idMap[id.type] = id.number;
    }
  });

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
      isPaid: false,
      total: 0,
    },
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
      identifications: [
        {
          type: IdentityType.ADHAR_CARD,
          number: idMap[IdentityType.ADHAR_CARD],
          active: Status.active,
        },
        {
          type: IdentityType.VOTER_CARD,
          number: idMap[IdentityType.VOTER_CARD],
          active: Status.active,
        },
        {
          type: IdentityType.DRIVING_LICENSE,
          number: idMap[IdentityType.DRIVING_LICENSE],
          active: Status.active,
        },
      ],
      emergencyContacts: data?.emergencyContacts ?? [],
      notes: data?.notes ?? [],
    },

    arrivalState: OpdArrival.ROUTINE,
    consultantDoctor: { userId: null },
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
  const editingIndex = billingItemForm.watch("index");

  const billingItemQuery = useInfiniteBillingSectionsList(
    { name: billingItemSearch },
    10,
  );

  const servicesQuery = useInfiniteServicesList({ name: serviceSearch }, 10);

  const flatServices = useMemo(
    () =>
      servicesQuery.data?.pages.flatMap((p) =>
        p.data.flatMap((f) => ({ ...f, label: f.name, value: f.id })),
      ),
    [servicesQuery.data],
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
      cell: ({ row }) => row.original.service.name,
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
        />
        <div className="col-span-2">
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
          // enableGrouping
          // grouping={["billingSectionName"]}
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
    name: "invoice.transactions",
    control: form.control,
  });

  const transactionForm = useForm<transactionValidatorType>({
    resolver: zodResolver(transactionsValidator),
  });

  const addedTransactions = form.watch("invoice.transactions");
  const isPaid = form.watch("invoice.isPaid");
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
  const [locationSearch, setLocationSearch] = useState("");
  const locationQuery = useInfiniteLocationsList({ name: locationSearch }, 10);

  return (
    <CustomLayout
      title="Personal Details"
      contentClassName="grid grid-cols-2 space-x-2 pb-0"
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
      </div>
      <div>
        <FormField<opdValidatorType>
          label="Address Line 1"
          name="patient.addresses.0.addressLineOne"
          control={form.control}
          type="text"
        />

        <FormInfiniteSelect<
          Location,
          PaginatedResponse<Location>,
          string,
          opdValidatorType
        >
          control={form.control}
          label="City"
          name="patient.addresses.0.location"
          query={locationQuery}
          getItems={(p) => p?.data}
          valueKey={(i) => String(i?.id)}
          labelKey={(i) => i?.city}
          placeholder="City"
          search={locationSearch}
          onSearchChange={setLocationSearch}
        />
        <FormInfiniteSelect<
          Location,
          PaginatedResponse<Location>,
          string,
          opdValidatorType
        >
          control={form.control}
          label="State"
          name="patient.addresses.0.location"
          query={locationQuery}
          getItems={(p) => p?.data}
          valueKey={(i) => String(i?.id)}
          labelKey={(i) => i?.state}
          placeholder="State"
          search={locationSearch}
          onSearchChange={setLocationSearch}
        />
        <FormInfiniteSelect<
          Location,
          PaginatedResponse<Location>,
          string,
          opdValidatorType
        >
          control={form.control}
          label="Country"
          name="patient.addresses.0.location"
          query={locationQuery}
          getItems={(p) => p?.data}
          valueKey={(i) => String(i?.id)}
          labelKey={(i) => i?.country}
          placeholder="Country"
          search={locationSearch}
          onSearchChange={setLocationSearch}
        />
        <FormInfiniteSelect<
          Location,
          PaginatedResponse<Location>,
          string,
          opdValidatorType
        >
          control={form.control}
          label="Post Code"
          name="patient.addresses.0.location"
          query={locationQuery}
          getItems={(p) => p?.data}
          valueKey={(i) => String(i?.id)}
          labelKey={(i) => i?.postcode}
          placeholder="Country"
          search={locationSearch}
          onSearchChange={setLocationSearch}
        />
        <div className="grid grid-cols-2 space-x-2">
          <FormField<opdValidatorType>
            label="Phone"
            name="patient.contacts.0.value"
            control={form.control}
            type="text"
          />

          <FormField<opdValidatorType>
            label="Aadhar Number"
            name="patient.identifications.0.number"
            control={form.control}
            type="text"
          />

          <FormField<opdValidatorType>
            label="Mobile"
            name="patient.contacts.1.value"
            control={form.control}
            type="text"
          />

          <FormField<opdValidatorType>
            label="Voter Card Number"
            name="patient.identifications.1.number"
            control={form.control}
            type="text"
          />
          <FormField<opdValidatorType>
            label="Email"
            name="patient.contacts.2.value"
            control={form.control}
            type="text"
          />

          <FormField<opdValidatorType>
            label="Driving License"
            name="patient.identifications.2.number"
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

  const { mutateAsync, isPending } = useCreateOpd();
  const params: { patientId: string } = useParams();
  const { data: patient, isLoading } = useGetPatient(params?.patientId);
  const consultingDoctorQuery = useInfiniteDoctorList(
    {
      doctorType: "consulting",
      name: consultantValue,
    },
    10,
  );
  const referringDoctorQuery = useInfiniteDoctorList(
    {
      name: referringValue,
    },
    10,
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
    return <div />;
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
        <PatientForm form={form} />
        <CustomLayout
          title="Billing"
          contentClassName="grid grid-cols-2 pb-0 space-x-2"
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
          <FormInfiniteSelect<
            Doctor,
            PaginatedResponse<Doctor>,
            string,
            opdValidatorType
          >
            label="Consultant"
            name="consultantDoctor"
            control={form.control}
            query={consultingDoctorQuery}
            getItems={(data) => data?.data}
            labelKey={(item) => item?.user?.name}
            valueKey={(item) => String(item?.userId)}
            search={consultantValue}
            onSearchChange={setConsultantValue}
            required
          />
          <FormInfiniteSelect<
            Doctor,
            PaginatedResponse<Doctor>,
            string,
            opdValidatorType
          >
            label="Referred By"
            name="referredDoctor"
            control={form.control}
            query={referringDoctorQuery}
            getItems={(data) => data?.data}
            labelKey={(item) => item?.user?.name}
            valueKey={(item) => String(item?.userId)}
            search={referringValue}
            onSearchChange={setReferringValue}
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
