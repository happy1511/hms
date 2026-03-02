"use client";

import CustomButton from "@/components/common/CustomButton";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import { PurchaseOrderGetPayload } from "@/generated/prisma/models";
import { useInfiniteDrugList } from "@/hooks/query/drug";
import { useInfiniteDrugBillingCategoryList } from "@/hooks/query/drugBillingCategory";
import { useCreateGrn } from "@/hooks/query/pharmacyGrn";
import { useGetPurchaseOrder } from "@/hooks/query/pharmacyPurchaseOrder";
import {
  grnValidator,
  grnValidatorType,
} from "@/validators/api/masters/pharmacyGRN";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Path, useFieldArray, useForm, UseFormReturn } from "react-hook-form";

type Props = {
  form: UseFormReturn<grnValidatorType>;
};

type ServiceRowProps = {
  index: number;
  form: UseFormReturn<grnValidatorType>;
};

const getInitialValues = (
  data: PurchaseOrderGetPayload<{
    include: {
      supplier: true;
      items: { include: { category: true; drug: true } };
    };
  }>,
): grnValidatorType => {
  return {
    grnItems: data?.items?.map((i) => ({
      drug: i.drug,
      purchasePrice: i.total,
      quantityInStock: i.quantity,
      expiryDate: new Date(),
      id: i.id,
    })),
    orderId: data.id,
  };
};

const ServiceRow = ({ index, form }: ServiceRowProps) => {
  const [drugSearch, setDrugSearch] = useState("");
  const [billingCategorySearch, setBillingCategorySearch] = useState("");
  const drugsQuery = useInfiniteDrugList({ name: drugSearch }, 10);
  const billingCategoryQuery = useInfiniteDrugBillingCategoryList(
    { name: billingCategorySearch },
    10,
  );

  const { control, watch, setValue, getValues } = form;
  const { remove } = useFieldArray({
    control,
    name: "grnItems",
  });

  const rowPath = `grnItems.${index}` as Path<grnValidatorType>;

  const quantity = watch(`${rowPath}.quantity` as Path<grnValidatorType>);
  const rate = watch(`${rowPath}.rate` as Path<grnValidatorType>);
  const discountPercentage = watch(
    `${rowPath}.discountPercentage` as Path<grnValidatorType>,
  );
  const total = watch(`${rowPath}.total` as Path<grnValidatorType>);

  useEffect(() => {
    const q = Number(quantity) || 0;
    const r = Number(rate) || 0;
    const d = Number(discountPercentage) || 0;

    if (!q || !r) {
      setValue(`${rowPath}.total` as Path<grnValidatorType>, 0);
      return;
    }

    const gross = q * r;
    const discount = (gross * d) / 100;
    const finalTotal = +(gross - discount).toFixed(2);

    const currentTotal = getValues(
      `${rowPath}.total` as Path<grnValidatorType>,
    );

    if (currentTotal !== finalTotal) {
      setValue(`${rowPath}.total` as Path<grnValidatorType>, finalTotal, {
        shouldValidate: false,
        shouldDirty: true,
      });
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
          <FormField
            label="Name"
            control={control}
            name={`${rowPath}.drug.name` as Path<grnValidatorType>}
            type="text"
            readOnly
          />
          <div className="grid grid-cols-2 space-x-2">
            <FormField
              label="Batch No"
              control={control}
              name={`${rowPath}.batchNo` as Path<grnValidatorType>}
              type="number"
            />
            <FormField
              label="Quantity"
              type="number"
              name={`${rowPath}.quantity` as Path<grnValidatorType>}
              control={control}
            />
          </div>
        </div>
      </td>

      <td>
        <div className="px-2 py-1">
          <FormField
            label="Manufacturing Date"
            control={control}
            name={`${rowPath}.manufacturingDate` as Path<grnValidatorType>}
            type="date"
          />
          <FormField
            label="Expiry Date"
            control={control}
            name={`${rowPath}.expiryDate` as Path<grnValidatorType>}
            type="date"
          />
        </div>
      </td>

      {/* RATE */}
      <td>
        <div className="px-2 grid grid-cols-2 space-x-2 py-1">
          <FormField
            label="MRP"
            type="number"
            name={`${rowPath}.mrp` as Path<grnValidatorType>}
            control={control}
          />
          <FormField
            label="Purchase Price"
            type="number"
            name={`${rowPath}.purchasePrice` as Path<grnValidatorType>}
            control={control}
          />
          <FormField
            label="Selling Price"
            type="number"
            name={`${rowPath}.sellingPrice` as Path<grnValidatorType>}
            control={control}
          />
          <FormField
            label="WholeSale Price"
            type="number"
            name={`${rowPath}.wholeSalePrice` as Path<grnValidatorType>}
            control={control}
          />
        </div>
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

  const { fields } = useFieldArray({
    control,
    name: "grnItems",
  });

  return (
    <div className="space-y-3 p-2 h-full flex flex-col">
      <div className="w-full flex-1">
        <table className="w-full border text-tiny">
          <thead className="bg-muted">
            <tr>
              <th>
                <div className="px-2 py-1">#</div>
              </th>
              <th className="w-62.5">
                <div className="px-2 py-1">Drug</div>
              </th>
              <th className="w-62.5">
                <div className="px-2 py-1">Manufacturing/Expiry Date</div>
              </th>
              <th>
                <div className="px-2 py-1">
                  MRP/Purchase/Selling/WholeSale Price
                </div>
              </th>
              <th></th>
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
  data: PurchaseOrderGetPayload<{
    include: {
      supplier: true;
      items: { include: { category: true; drug: true } };
    };
  }>;
}) => {
  const { mutateAsync: create, isPending: creating } = useCreateGrn();

  const form = useForm<grnValidatorType>({
    defaultValues: getInitialValues(data),
    resolver: zodResolver(grnValidator),
  });

  const onSubmit = (values: grnValidatorType) => {
    create(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <BillingItemsTable form={form} />

        <CustomButton disabled={creating} type="submit">
          Submit
        </CustomButton>
      </form>
    </Form>
  );
};

const GrnForm = () => {
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

  return order && <UpdateCreateForm data={order} />;
};

export default GrnForm;
