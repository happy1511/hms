"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import FormField from "@/components/form-inputs/FormField";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import { Form } from "@/components/ui/form";
import { DrugSupplier, Status } from "@/generated/prisma/client";
import { PurchaseOrderGetPayload } from "@/generated/prisma/models";
import { useInfiniteDrugList } from "@/hooks/query/drug";
import { useInfiniteDrugBillingCategoryList } from "@/hooks/query/drugBillingCategory";
import { useInfiniteDrugSupplierList } from "@/hooks/query/drugSupplier";
import {
  useCreatePurchaseOrder,
  useGetPurchaseOrder,
  useUpdatePurchaseOrder,
} from "@/hooks/query/pharmacyPurchaseOrder";
import { PaginatedResponse } from "@/lib/type";
import {
  purchaseOrderValidator,
  purchaseOrderValidatorType,
} from "@/validators/api/masters/pharmacyPurchase";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon, PlusIcon, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Path, useFieldArray, useForm, UseFormReturn } from "react-hook-form";

type Props = {
  form: UseFormReturn<purchaseOrderValidatorType>;
};

type ServiceRowProps = {
  index: number;
  form: UseFormReturn<purchaseOrderValidatorType>;
};

const getInitialValues = (
  data?: PurchaseOrderGetPayload<{
    include: {
      supplier: true;
      items: { include: { category: true; drug: true } };
    };
  }>,
): purchaseOrderValidatorType => {
  return {
    supplier: data?.supplier ?? { id: undefined },
    orderDate: data?.orderDate ?? new Date(),
    remarks: data?.remarks ?? "",
    items: data?.items ?? [
      {
        quantity: 1,
        discountPercentage: 0,
        rate: 0,
        total: 0,
        drug: {
          id: undefined,
          gstPercentage: 0,
          cGstPercentage: 0,
          sGstPercentage: 0,
          iGstPercentage: 0,
        },
        category: { id: undefined },
      },
    ],
  };
};

const ServiceRow = ({ index, form }: ServiceRowProps) => {
  const [drugSearch, setDrugSearch] = useState("");
  const [billingCategorySearch, setBillingCategorySearch] = useState("");
  const drugsQuery = useInfiniteDrugList(
    { name: drugSearch, status: Status["active"] },
    10,
  );
  const billingCategoryQuery = useInfiniteDrugBillingCategoryList(
    { name: billingCategorySearch, status: Status["active"] },
    10,
  );

  const { control, watch, setValue, getValues } = form;
  const { remove } = useFieldArray({
    control,
    name: "items",
  });

  const rowPath = `items.${index}` as Path<purchaseOrderValidatorType>;

  const quantity = watch(
    `${rowPath}.quantity` as Path<purchaseOrderValidatorType>,
  );
  const drug = watch(`${rowPath}.drug` as Path<purchaseOrderValidatorType>) as
    | purchaseOrderValidatorType["items"][number]["drug"]
    | undefined;
  const rate = watch(`${rowPath}.rate` as Path<purchaseOrderValidatorType>);
  const discountPercentage = watch(
    `${rowPath}.discountPercentage` as Path<purchaseOrderValidatorType>,
  );
  const total = watch(`${rowPath}.total` as Path<purchaseOrderValidatorType>);

  useEffect(() => {
    const q = Number(quantity) || 0;
    const r = Number(rate) || 0;
    const d = Number(discountPercentage) || 0;

    if (!q || !r) {
      setValue(`${rowPath}.total` as Path<purchaseOrderValidatorType>, 0);
      return;
    }

    const gross = q * r;
    const discount = (gross * d) / 100;
    const finalTotal = +(gross - discount).toFixed(2);

    const currentTotal = getValues(
      `${rowPath}.total` as Path<purchaseOrderValidatorType>,
    );

    if (currentTotal !== finalTotal) {
      setValue(
        `${rowPath}.total` as Path<purchaseOrderValidatorType>,
        finalTotal,
        {
          shouldValidate: false,
          shouldDirty: true,
        },
      );
    }
  }, [quantity, rate, discountPercentage, getValues, setValue, rowPath]);

  return (
    <tr className="border-t align-top">
      <td>
        <div className="px-2 py-1">{index + 1}</div>
      </td>

      {/* SERVICE */}
      <td>
        <div className="px-2 py-1">
          <FormInfiniteSelect
            control={control}
            name={`${rowPath}.drug` as Path<purchaseOrderValidatorType>}
            query={drugsQuery}
            getItems={(p) => p?.data}
            valueKey={(i) => String(i.id)}
            labelKey={(i) => i.name}
            search={drugSearch}
            onSearchChange={setDrugSearch}
            placeholder="Drug"
            hideError
          />
        </div>
      </td>

      <td>
        <div className="px-2 py-1">
          <FormInfiniteSelect
            control={control}
            name={`${rowPath}.category` as Path<purchaseOrderValidatorType>}
            query={billingCategoryQuery}
            getItems={(p) => p?.data}
            valueKey={(i) => String(i.id)}
            labelKey={(i) => i.name}
            search={billingCategorySearch}
            onSearchChange={setBillingCategorySearch}
            placeholder="Drug"
            hideError
          />
        </div>
      </td>

      {/* QTY */}
      <td>
        <div className="px-2 py-1 min-w-24">
          <FormField
            type="number"
            name={`${rowPath}.quantity` as Path<purchaseOrderValidatorType>}
            control={control}
            hideError
          />
        </div>
      </td>

      {/* RATE */}
      <td>
        <div className="px-2 py-1 min-w-28">
          <FormField
            type="number"
            name={`${rowPath}.rate` as Path<purchaseOrderValidatorType>}
            control={control}
            hideError
          />
        </div>
      </td>

      {/* DISC TYPE */}
      <td>
        <div className="px-2 py-1 min-w-30">
          <FormField
            type="number"
            name={
              `${rowPath}.discountPercentage` as Path<purchaseOrderValidatorType>
            }
            control={control}
            hideError
          />
        </div>
      </td>

      {/* RATE */}
      <td>
        <div className="px-2 py-1 text-center min-w-28">
          <p>{(drug?.gstPercentage as number) ?? 0}</p>
        </div>
      </td>

      {/* RATE */}
      <td>
        <div className="px-2 py-1 text-center min-w-28">
          <p>{(drug?.cGstPercentage as number) ?? 0}</p>
        </div>
      </td>

      {/* RATE */}
      <td>
        <div className="px-2 py-1 text-center min-w-28">
          <p>{(drug?.sGstPercentage as number) ?? 0}</p>
        </div>
      </td>

      {/* RATE */}
      <td>
        <div className="px-2 py-1 text-center min-w-28">
          <p>{(drug?.iGstPercentage as number) ?? 0}</p>
        </div>
      </td>

      {/* TOTAL */}
      <td className="font-semibold min-w-28">
        <div className="px-2 py-1 text-center">₹ {Number(total)}</div>
      </td>

      {/* REMOVE */}
      <td className="w-10">
        <div className="px-2 py-1">
          <button type="button" onClick={() => remove(index)}>
            <Trash2 className="size-2 text-destructive" />
          </button>
        </div>
      </td>
    </tr>
  );
};

const BillingItemsTable = ({ form }: Props) => {
  const { control } = form;

  const { fields, append } = useFieldArray({
    control,
    name: "items",
  });

  return (
    <div className="space-y-3 p-2 h-full flex flex-col">
      {/* Add Row */}
      <div className="flex w-full justify-between items-center">
        <button
          className="flex gap-1 items-center  text-tiny"
          type="button"
          onClick={() =>
            append({
              quantity: 1,
              discountPercentage: 0,
              rate: 0,
              total: 0,
              drug: {
                id: undefined,
                gstPercentage: 0,
                cGstPercentage: 0,
                sGstPercentage: 0,
                iGstPercentage: 0,
              },
              category: { id: undefined },
            })
          }
        >
          <PlusIcon className="size-2 text-black" /> <p>Add New Item</p>
        </button>
      </div>

      <div className="w-full overflow-x-auto pb-20">
        <table className="w-full border min-w-300 text-tiny">
          <thead className="bg-muted">
            <tr>
              <th className="min-w-10">
                <div className="px-2 py-1">#</div>
              </th>
              <th className="w-62.5">
                <div className="px-2 py-1">Drug</div>
              </th>
              <th className="w-62.5">
                <div className="px-2 py-1">Category</div>
              </th>
              <th className="min-w-24">
                <div className="px-2 py-1">Qty</div>
              </th>
              <th className="min-w-28">
                <div className="px-2 py-1">Rate</div>
              </th>
              <th className="min-w-30">
                <div className="px-2 py-1">Discount (%)</div>
              </th>
              <th className="min-w-28">
                <div className="px-2 py-1">GST (%)</div>
              </th>
              <th className="min-w-28">
                <div className="px-2 py-1">cGST (%)</div>
              </th>
              <th className="min-w-28">
                <div className="px-2 py-1">sGST (%)</div>
              </th>
              <th className="min-w-28">
                <div className="px-2 py-1">iGST (%)</div>
              </th>
              <th className="min-w-28">
                <div className="px-2 py-1">Total</div>
              </th>
              <th className="min-w-10"></th>
            </tr>
          </thead>

          <tbody>
            {fields.map((field, index) => (
              <ServiceRow key={field.id} index={index} form={form} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const UpdateCreateForm = ({
  data,
}: {
  data?: PurchaseOrderGetPayload<{
    include: {
      supplier: true;
      items: { include: { category: true; drug: true } };
    };
  }>;
}) => {
  const [supplierSearchValue, setSupplierSearchValue] = useState("");
  const { mutateAsync: create, isPending: creating } = useCreatePurchaseOrder();
  const { mutateAsync: update, isPending: updating } = useUpdatePurchaseOrder();
  const supplierQuery = useInfiniteDrugSupplierList(
    { name: supplierSearchValue, status: Status["active"] },
    10,
  );

  const form = useForm<purchaseOrderValidatorType>({
    defaultValues: getInitialValues(data),
    resolver: zodResolver(purchaseOrderValidator),
  });

  const onSubmit = (values: purchaseOrderValidatorType) => {
    if (data) {
      update({ orderId: Number(data.id), ...values });
    } else {
      create(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-x-2">
          <FormField<purchaseOrderValidatorType>
            label="Name"
            type="date"
            name="orderDate"
            control={form.control}
            required
          />

          <FormInfiniteSelect<
            DrugSupplier,
            PaginatedResponse<DrugSupplier>,
            string,
            purchaseOrderValidatorType
          >
            label="Supplier"
            name="supplier"
            control={form.control}
            query={supplierQuery}
            getItems={(p) => p?.data}
            valueKey={(i) => String(i?.id)}
            labelKey={(i) => i?.name}
            search={supplierSearchValue}
            onSearchChange={setSupplierSearchValue}
            required
          />
        </div>

        <BillingItemsTable form={form} />

        <FormField<purchaseOrderValidatorType>
          label="Remarks"
          type="textarea"
          name="remarks"
          control={form.control}
        />
        <CustomButton disabled={creating || updating} type="submit">
          Submit
        </CustomButton>
      </form>
    </Form>
  );
};

const PurchaseOrderForm = () => {
  const params: { orderId: string } = useParams();
  const { data: order, isLoading } = useGetPurchaseOrder(params?.orderId);

  if (isLoading && params?.orderId) {
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

  if (params?.orderId && !order) {
    return <div />;
  }

  return (
    <CustomLayout title="PO">
      {params?.orderId ? (
        <UpdateCreateForm data={order} />
      ) : (
        <UpdateCreateForm />
      )}
    </CustomLayout>
  );
};

export default PurchaseOrderForm;
