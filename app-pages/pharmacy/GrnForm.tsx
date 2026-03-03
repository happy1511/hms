"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import FormField from "@/components/form-inputs/FormField";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import { Form } from "@/components/ui/form";
import {
  Drug,
  DrugBillingCategory,
  DrugSupplier,
  Status,
} from "@/generated/prisma/client";
import { PurchaseOrderGetPayload } from "@/generated/prisma/models";
import { useInfiniteDrugList } from "@/hooks/query/drug";
import { useInfiniteDrugBillingCategoryList } from "@/hooks/query/drugBillingCategory";
import { useInfiniteDrugSupplierList } from "@/hooks/query/drugSupplier";
import { useCreateGrn } from "@/hooks/query/pharmacyGrn";
import { useGetPurchaseOrder } from "@/hooks/query/pharmacyPurchaseOrder";
import { PaginatedResponse } from "@/lib/type";
import {
  grnValidator,
  grnValidatorType,
} from "@/validators/api/masters/pharmacyGRN";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon, PlusIcon, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Path, useFieldArray, useForm, UseFormReturn } from "react-hook-form";

type Props = {
  form: UseFormReturn<grnValidatorType>;
  readonlyFromPo: boolean;
};

type ServiceRowProps = {
  index: number;
  form: UseFormReturn<grnValidatorType>;
  readonlyFromPo: boolean;
};

const getInitialValues = (
  data?: PurchaseOrderGetPayload<{
    include: {
      supplier: true;
      items: { include: { category: true; drug: true } };
    };
  }>,
): grnValidatorType => {
  if (!data) {
    return {
      supplier: { id: undefined as unknown as number },
      grnItems: [
        {
          category: { id: undefined as unknown as number },
          drug: {
            id: undefined as unknown as number,
            gstPercentage: 0,
            cGstPercentage: 0,
            sGstPercentage: 0,
            iGstPercentage: 0,
          },
          quantity: 1,
          batchNo: 0,
          expiryDate: new Date(),
          manufacturingDate: new Date(),
          purchasePrice: 0,
          mrp: 0,
          sellingPrice: 0,
          wholeSalePrice: 0,
        },
      ],
    };
  }

  return {
    supplier: data.supplier,
    orderId: data.id,
    grnItems: data.items.map((i) => ({
      id: i.id,
      category: i.category,
      drug: i.drug,
      purchasePrice: i.rate,
      quantity: i.quantity,
      expiryDate: new Date(),
      manufacturingDate: new Date(),
      batchNo: 0,
      mrp: 0,
      sellingPrice: 0,
      wholeSalePrice: 0,
    })),
  };
};

const ServiceRow = ({ index, form, readonlyFromPo }: ServiceRowProps) => {
  const [drugSearch, setDrugSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const drugsQuery = useInfiniteDrugList(
    { name: drugSearch, status: Status["active"] },
    10,
  );
  const billingCategoryQuery = useInfiniteDrugBillingCategoryList(
    { name: categorySearch, status: Status["active"] },
    10,
  );

  const { control } = form;
  const { remove } = useFieldArray({
    control,
    name: "grnItems",
  });

  const rowPath = `grnItems.${index}` as Path<grnValidatorType>;

  return (
    <tr className="border-t align-top">
      <td>
        <div className="px-2 py-1">{index + 1}</div>
      </td>

      <td>
        <div className="px-2 py-1">
          {readonlyFromPo ? (
            <FormField
              label="Name"
              control={control}
              name={`${rowPath}.drug.name` as Path<grnValidatorType>}
              type="text"
              readOnly
            />
          ) : (
            <FormInfiniteSelect<
              Drug,
              PaginatedResponse<Drug>,
              string,
              grnValidatorType
            >
              label="Drug"
              control={control}
              name={`${rowPath}.drug` as Path<grnValidatorType>}
              query={drugsQuery}
              getItems={(p) => p?.data}
              valueKey={(i) => String(i.id)}
              labelKey={(i) => i.name}
              search={drugSearch}
              onSearchChange={setDrugSearch}
            />
          )}

          <div className="grid grid-cols-2 gap-2">
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
          {readonlyFromPo ? (
            <FormField
              label="Category"
              control={control}
              name={`${rowPath}.category.name` as Path<grnValidatorType>}
              type="text"
              readOnly
            />
          ) : (
            <FormInfiniteSelect<
              DrugBillingCategory,
              PaginatedResponse<DrugBillingCategory>,
              string,
              grnValidatorType
            >
              label="Category"
              control={control}
              name={`${rowPath}.category` as Path<grnValidatorType>}
              query={billingCategoryQuery}
              getItems={(p) => p?.data}
              valueKey={(i) => String(i.id)}
              labelKey={(i) => i.name}
              search={categorySearch}
              onSearchChange={setCategorySearch}
            />
          )}
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

      <td>
        <div className="px-2 grid grid-cols-2 gap-2 py-1">
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

const BillingItemsTable = ({ form, readonlyFromPo }: Props) => {
  const { control } = form;
  const { fields, append } = useFieldArray({
    control,
    name: "grnItems",
  });

  return (
    <div className="space-y-3 p-2 h-full flex flex-col">
      {!readonlyFromPo && (
        <div className="flex w-full justify-between items-center">
          <button
            className="flex gap-1 items-center text-tiny"
            type="button"
            onClick={() =>
              append({
                category: { id: undefined as unknown as number },
                drug: {
                  id: undefined as unknown as number,
                  gstPercentage: 0,
                  cGstPercentage: 0,
                  sGstPercentage: 0,
                  iGstPercentage: 0,
                },
                quantity: 1,
                batchNo: 0,
                expiryDate: new Date(),
                manufacturingDate: new Date(),
                purchasePrice: 0,
                mrp: 0,
                sellingPrice: 0,
                wholeSalePrice: 0,
              })
            }
          >
            <PlusIcon className="size-2 text-black" />
            <p>Add Item</p>
          </button>
        </div>
      )}
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
                <div className="px-2 py-1">Category / Mfg / Exp</div>
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
              <ServiceRow
                key={field.id}
                index={index}
                form={form}
                readonlyFromPo={readonlyFromPo}
              />
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
  const [supplierSearch, setSupplierSearch] = useState("");
  const supplierQuery = useInfiniteDrugSupplierList(
    { name: supplierSearch, status: Status["active"] },
    10,
  );
  const { mutateAsync: create, isPending: creating } = useCreateGrn();
  const readonlyFromPo = Boolean(data);

  const form = useForm<grnValidatorType>({
    defaultValues: getInitialValues(data),
    resolver: zodResolver(grnValidator),
  });

  const onSubmit = (values: grnValidatorType) => {
    create(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        {!readonlyFromPo && (
          <div className="grid grid-cols-2 gap-2">
            <FormInfiniteSelect<
              DrugSupplier,
              PaginatedResponse<DrugSupplier>,
              string,
              grnValidatorType
            >
              label="Supplier"
              control={form.control}
              name="supplier"
              query={supplierQuery}
              getItems={(p) => p?.data}
              valueKey={(i) => String(i.id)}
              labelKey={(i) => i.name}
              search={supplierSearch}
              onSearchChange={setSupplierSearch}
              required
            />
          </div>
        )}

        <BillingItemsTable form={form} readonlyFromPo={readonlyFromPo} />

        <CustomButton disabled={creating} type="submit">
          Submit
        </CustomButton>
      </form>
    </Form>
  );
};

const GrnForm = () => {
  const params: { orderId: string } = useParams();
  const isNewGrn = params?.orderId === "new";
  const { data: order, isLoading } = useGetPurchaseOrder(
    !isNewGrn ? params?.orderId : undefined,
  );

  if (isLoading && params?.orderId && !isNewGrn) {
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

  if (!isNewGrn && params?.orderId && !order) {
    return <div />;
  }

  return (
    <CustomLayout title={isNewGrn ? "GRN (Without PO)" : "GRN"}>
      <UpdateCreateForm data={!isNewGrn ? order : undefined} />
    </CustomLayout>
  );
};

export default GrnForm;
