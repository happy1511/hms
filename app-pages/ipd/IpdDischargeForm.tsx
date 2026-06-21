"use client";

import { CustomAlert } from "@/components/common/CustomAlert";
import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import DischargeDueConfirmModal from "@/components/ipd/DischargeDueConfirmModal";
import NoPermission from "@/components/common/NoPermission";
import FormField from "@/components/form-inputs/FormField";
import { FormInfiniteSelect } from "@/components/form-inputs/FormInfiniteSelect";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Drug } from "@/generated/prisma/client";
import { ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useInfiniteDrugList } from "@/hooks/query/drug";
import {
  IpdDischargeSummaryResponse,
  useDischargeIpd,
  useGetIpdDischargeSummary,
  useUpsertIpdDischargeSummary,
} from "@/hooks/query/ipd";
import { ColumnDefWithClass, PaginatedResponse, SelectOption } from "@/lib/type";
import { cn, hasActionPermission } from "@/lib/utils";
import {
  ipdDischargeDrugValidator,
  ipdDischargeSummaryValidator,
  ipdDischargeSummaryValidatorType,
  ipdDischargeDrugValidatorType,
} from "@/validators/api/ipd/ipd";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit2, LoaderIcon, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useFieldArray, UseFieldArrayRemove, useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

const valueOrDash = (value?: unknown) => {
  if (value === null || value === undefined || value === "") return "--";
  return String(value);
};

const UNIT_VALUES = [
  "0",
  "[AU]",
  "[Amb'a'1'U]",
  "[BAU]",
  "[arb'U]",
  "[CCID_50]",
  "[CFU]",
  "Ci",
  "[D'ag'U]",
  "dL",
  "[FFU]",
  "gm",
  "[hp_C]",
  "{kp_C}",
  "[hp_M]",
  "[hp_Q]",
  "[hp_X]",
  "kg",
  "[iU]",
  "[Lf]",
  "L",
  "uCi",
  "ug",
  "uL",
  "umol",
  "um",
  "mCi",
  "meq",
  "mg",
  "mL",
  "mm",
  "mmol",
  "mo",
  "ng",
  "nmol",
  "[PFU]",
  "[PNU]",
  "cm2",
  "[TCID_50]",
  "U",
  "[USP'U]",
] as const;

const ROUTE_VALUES = [
  "Subcutaneous",
  "Intramuscular",
  "Intravenous",
  "Oral route",
  "Rectal route",
  "Sublingual and buccal routes",
  "Vaginal route",
  "Ocular route",
  "Otic route",
  "Nasal route",
  "Inhalation route",
  "Nebulization route",
  "Cutaneous route",
  "Transdermal route",
  "Local Application",
  "Epidural",
] as const;

const unitOptions: SelectOption[] = UNIT_VALUES.map((value) => ({
  label: value,
  value,
}));

const routeOptions: SelectOption[] = ROUTE_VALUES.map((value) => ({
  label: value,
  value,
}));

const Actions = ({
  data,
  remove,
  index,
  form,
}: {
  form: UseFormReturn<PrescriptionRowFormType>;
  data: DischargeDrugRow;
  remove: UseFieldArrayRemove;
  index: number;
}) => {
  return (
    <>
      <Button
        variant="outline"
        className="h-auto shadow-none p-1 cursor-pointer"
        onClick={() =>
          form.reset({
            index,
            drug: null,
            clientId: data.clientId,
            drugId: data.drugId ? Number(data.drugId) : null,
            drugName: data.drug?.name || data.drugName || "",
            unit: data.unit ?? null,
            route: data.route,
            frequency: data.frequency,
            days: data.days,
            remarks: data.remarks ?? null,
          })
        }
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

type DischargeDrugRow = ipdDischargeDrugValidatorType & {
  drugName?: string | null;
  drug?: { id: number; name: string } | null;
  clientId?: string;
};

type PrescriptionRowFormType = {
  index?: number | null;
  drug?: Drug | null;
  drugId?: unknown;
  drugName?: string;
  clientId?: string;
  frequency?: unknown;
  days?: unknown;
  unit?: string | null;
  route?: string;
  remarks?: string | null;
};

const Prescription = ({ form }: { form: UseFormReturn<ipdDischargeSummaryValidatorType> }) => {
  const { append, update, remove } = useFieldArray({
    name: "drugs",
    control: form.control,
  });

  const [drugSearchValue, setDrugSearchValue] = useState("");
  const drugsQuery = useInfiniteDrugList({ name: drugSearchValue }, 20);

  const prescriptionForm = useForm<PrescriptionRowFormType>({
    defaultValues: {
      drug: null,
    },
  });

  const addedDrugs = form.watch("drugs");
  const editingIndex = prescriptionForm.watch("index");
  const selectedDrug = prescriptionForm.watch("drug");

  const makeClientId = () =>
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

  useEffect(() => {
    if (!selectedDrug?.name) return;
    prescriptionForm.setValue("drugId", selectedDrug.id, { shouldDirty: true });
    prescriptionForm.setValue("drugName", selectedDrug.name, { shouldDirty: true });
  }, [selectedDrug, prescriptionForm]);

  const columns: ColumnDefWithClass<DischargeDrugRow>[] = useMemo(
    () => [
      {
        accessorKey: "drugName",
        header: "Name",
        headerClassName: "min-w-15 max-w-20",
        cellClassName: "min-w-15 max-w-20",
        cell: ({ row }) =>
          valueOrDash(row.original.drug?.name || row.original.drugName),
      },
      {
        accessorKey: "unit",
        header: "Unit",
        headerClassName: "min-w-15",
        cellClassName: "min-w-15",
      },
      {
        accessorKey: "route",
        header: "Route",
        headerClassName: "min-w-25",
        cellClassName: "min-w-25",
      },
      {
        accessorKey: "frequency",
        header: "Frequency",
        headerClassName: "min-w-20",
        cellClassName: "min-w-20",
      },
      {
        accessorKey: "days",
        header: "Days",
        headerClassName: "min-w-20",
        cellClassName: "min-w-20",
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        headerClassName: "min-w-40",
        cellClassName: "min-w-40",
      },
      {
        id: "actions",
        header: () => <p>Action</p>,
        cell: ({ row }) => (
          <Actions
            data={row.original}
            form={prescriptionForm}
            index={row.index}
            remove={remove}
          />
        ),
        headerClassName: "min-w-20 max-w-30",
        cellClassName: "min-w-20 max-w-30",
      },
    ],
    [prescriptionForm, remove],
  );

  const handleAddUpdate = () => {
    const values = prescriptionForm.getValues();
    const parsed = ipdDischargeDrugValidator.safeParse({
      index: values.index ?? null,
      drugId: values.drug?.id ?? values.drugId ?? 0,
      frequency: values.frequency,
      days: values.days,
      unit: values.unit || null,
      route: values.route,
      remarks: values.remarks ?? null,
    });

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      toast.error(firstError?.message || "Please fill required drug details");
      return;
    }

    const normalizedId = Number(parsed.data.drugId);
    const duplicateIndex = (addedDrugs || []).findIndex(
      (drug: any, i) => Number(drug.drugId) === normalizedId && i !== parsed.data.index,
    );

    if (duplicateIndex !== -1) {
      toast.error("This drug is already added in prescription");
      return;
    }

    if (typeof parsed.data.index === "number") {
      const existing = (addedDrugs as any[])?.[parsed.data.index] as DischargeDrugRow | undefined;
      const nextRow: DischargeDrugRow = {
        ...parsed.data,
        clientId: existing?.clientId || makeClientId(),
        drug: values.drug ? { id: values.drug.id, name: values.drug.name } : existing?.drug,
        drugName: values.drug?.name || values.drugName || existing?.drugName || "",
      };
      update(parsed.data.index, nextRow as any);
    } else {
      const nextRow: DischargeDrugRow = {
        ...parsed.data,
        clientId: makeClientId(),
        drug: values.drug ? { id: values.drug.id, name: values.drug.name } : null,
        drugName: values.drug?.name || values.drugName || "",
      };
      append(nextRow as any);
    }

    prescriptionForm.reset({ drug: null });
    setDrugSearchValue("");
  };

  return (
    <CustomLayout title="Prescription">
      <div className="py-2 grid grid-cols-6 space-x-2">
        <FormInfiniteSelect<
          Drug,
          PaginatedResponse<Drug>,
          string,
          PrescriptionRowFormType
        >
          name="drug"
          control={prescriptionForm.control}
          label="Select Drug"
          query={drugsQuery}
          getItems={(d) => d?.data}
          labelKey={(i) => i.name}
          valueKey={(i) => String(i.id)}
          search={drugSearchValue}
          onSearchChange={setDrugSearchValue}
          placeholder="Search drug from master"
        />
        <FormField
          control={prescriptionForm.control}
          label="Name"
          name="drugName"
          type="text"
          readOnly
          required
        />
        <FormField
          control={prescriptionForm.control}
          label="Unit"
          name="unit"
          type="select"
          options={unitOptions}
          placeholder="-- Unit --"
        />
        <FormField
          control={prescriptionForm.control}
          label="Route"
          name="route"
          type="select"
          options={routeOptions}
          placeholder="-- Route --"
          required
        />
        <FormField
          control={prescriptionForm.control}
          label="Frequency"
          name="frequency"
          type="number"
          required
        />
        <FormField
          control={prescriptionForm.control}
          label="Days"
          name="days"
          type="number"
          required
        />
        <div className="col-span-6">
          <FormField
            control={prescriptionForm.control}
            label="Remarks"
            name="remarks"
            type="text"
          />
        </div>
        <div className="col-span-6 space-x-2">
          <div className="w-full flex justify-end">
            <CustomButton type="button" onClick={handleAddUpdate} className="self-end">
              {typeof editingIndex === "number" ? "Update" : "Add"}
            </CustomButton>
          </div>
        </div>
      </div>
      <div>
        <CustomTable
          data={addedDrugs || []}
          columns={columns}
          getRowId={(row: any) => String(row.clientId ?? row.drugId ?? row.id)}
        />
      </div>
      <FormField
        control={form.control}
        label="Other Advice"
        name="otherAdvice"
        type="textarea"
      />
      <div className="grid grid-cols-[45%_10%_45%]">
        <FormField
          control={form.control}
          label="Follow Up After (days)"
          name="followUpAfterDays"
          type="number"
        />
        <p className="text-blue-300 font-semibold text-center">OR</p>
        <FormField
          control={form.control}
          label="Follow Up On Date"
          name="followUpDate"
          type="date"
        />
      </div>
      <FormField
        control={form.control}
        label="Follow Up Advice"
        name="followUpAdvice"
        type="textarea"
      />
    </CustomLayout>
  );
};

const normalizeSummaryToFormValues = (
  ipdId: number,
  data?: IpdDischargeSummaryResponse,
): ipdDischargeSummaryValidatorType => {
  const ipdDateTime = data?.ipdDateTime ? new Date(data.ipdDateTime) : new Date();
  const procedureDate = data?.procedureDate ? new Date(data.procedureDate) : null;
  const followUpDate = data?.followUpDate ? new Date(data.followUpDate) : null;

  return {
    ipdId,
    ipdDateTime,
    isUnfitForFurtherManagement: Boolean(data?.isUnfitForFurtherManagement),
    diagnosis: data?.diagnosis ?? "",
    procedureDate,
    procedure: data?.procedure ?? "",
    courseInHospital: data?.courseInHospital ?? "",
    investigationResults: data?.investigationResults ?? "",
    allergies: data?.allergies ?? "",
    diet: data?.diet ?? "",
    physicalActivity: data?.physicalActivity ?? "",
    followUpAfterDays: data?.followUpAfterDays ?? null,
    followUpDate,
    followUpAdvice: data?.followUpAdvice ?? "",
    otherAdvice: data?.otherAdvice ?? "",
    urgentCareWhen: data?.urgentCareWhen ?? "",
    isTransferred: Boolean(data?.isTransferred),
    remarks: data?.remarks ?? "",
    drugs: (data?.drugs ?? [])
      .filter((drug) => Boolean(drug?.drugId))
      .map((drug, i) => ({
        index: (drug.id ?? Date.now()) + i,
        drugId: Number(drug.drugId),
        drugName: (drug as any)?.drug?.name || "",
        frequency: Number(drug.frequency ?? 1),
        days: Number(drug.days ?? 1),
        unit: drug.unit ?? null,
        route: String(drug.route ?? ""),
        remarks: drug.remarks ?? null,
      })),
  };
};

const IpdDischargeForm = () => {
  const router = useRouter();
  const { ipdId }: { ipdId: string } = useParams();
  const { data: profile } = useProfile(false);

  const numericIpdId = Number(ipdId);
  const { data, isLoading } = useGetIpdDischargeSummary(ipdId);
  const { mutateAsync: saveSummary, isPending: saving } = useUpsertIpdDischargeSummary();
  const { mutateAsync: dischargeIpd, isPending: discharging } = useDischargeIpd();
  const [dueConfirmOpen, setDueConfirmOpen] = useState(false);

  const defaultValues = useMemo(
    () => normalizeSummaryToFormValues(numericIpdId, data),
    [data, numericIpdId],
  );

  const form = useForm<ipdDischargeSummaryValidatorType>({
    defaultValues,
    resolver: zodResolver(ipdDischargeSummaryValidator),
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const handleClear = () => {
    form.reset(
      normalizeSummaryToFormValues(numericIpdId, {
        ipdId: numericIpdId,
        drugs: [],
      }),
    );
  };

  const handleSave = async (values: ipdDischargeSummaryValidatorType) => {
    const payload: ipdDischargeSummaryValidatorType = {
      ...values,
      drugs: (values.drugs as any[]).map((d) => ({
        index: d.index ?? null,
        drugId: d.drugId,
        frequency: d.frequency,
        days: d.days,
        unit: d.unit ?? null,
        route: d.route,
        remarks: d.remarks ?? null,
      })),
    };
    await saveSummary(payload);
  };

  const completeDischarge = async (values: ipdDischargeSummaryValidatorType) => {
    await handleSave(values);
    await dischargeIpd({ ipdId: numericIpdId });
    setDueConfirmOpen(false);
    router.back();
  };

  const handlePrint = form.handleSubmit(async (values) => {
    await handleSave(values);
    window.open(`/ipd/discharge-print/${numericIpdId}`, "_blank");
  });

  const handleOnlySave = form.handleSubmit(async (values) => {
    await handleSave(values);
  });

  const handleDischarge = form.handleSubmit(async (values) => {
    if (Number(data?.dueAmount || 0) > 0) {
      setDueConfirmOpen(true);
      return;
    }
    await completeDischarge(values);
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon className="size-4 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <div />;
  }

  const canUpdate = hasActionPermission(
    profile.data,
    ModuleType.DISCHARGE_PATIENT,
    ActionType.UPDATE,
  );

  if (!canUpdate) {
    return (
      <CustomLayout title="Discharge Summary">
        <NoPermission />
      </CustomLayout>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-2">
        <CustomLayout title="Discharge Summary" contentClassName="grid grid-cols-2 gap-x-2">
          <FormField control={form.control} label="IPD Date" name="ipdDateTime" type="dateTime" />
          <div className="flex items-end">
            <FormField
              control={form.control}
              label="This patient is unfit for further medical surgical management"
              name="isUnfitForFurtherManagement"
              type="checkbox"
            />
          </div>

          <div className="col-span-2">
            <FormField control={form.control} label="Diagnosis" name="diagnosis" type="textarea" />
          </div>

          <FormField
            control={form.control}
            label="Procedure Date"
            name="procedureDate"
            type="date"
          />
          <FormField
            control={form.control}
            label="When to obtain urgent care?"
            name="urgentCareWhen"
            type="text"
          />

          <div className="col-span-2">
            <FormField control={form.control} label="Procedure" name="procedure" type="richText" />
          </div>
          <div className="col-span-2">
            <FormField
              control={form.control}
              label="Course in the Hospital"
              name="courseInHospital"
              type="richText"
            />
          </div>
          <div className="col-span-2">
            <FormField
              control={form.control}
              label="Investigation Results"
              name="investigationResults"
              type="textarea"
            />
          </div>

          <FormField control={form.control} label="Allergies" name="allergies" type="text" />
          <FormField control={form.control} label="Diet" name="diet" type="text" />
          <FormField
            control={form.control}
            label="Physical Activity"
            name="physicalActivity"
            type="text"
          />
          <div className="flex items-end">
            <FormField
              control={form.control}
              label="This patient has been transfered."
              name="isTransferred"
              type="checkbox"
            />
          </div>

          <div className="col-span-2">
            <FormField control={form.control} label="Remarks" name="remarks" type="textarea" />
          </div>
        </CustomLayout>

        <Prescription form={form} />

        <div className={cn("flex justify-end gap-2")}>
          <CustomButton
            type="button"
            variant="outline"
            onClick={handleClear}
            disabled={saving || discharging}
          >
            Clear
          </CustomButton>
          <CustomButton
            type="button"
            variant="outline"
            onClick={handlePrint}
            disabled={saving || discharging}
          >
            Print
          </CustomButton>
          <CustomButton
            type="button"
            variant="outline"
            onClick={handleOnlySave}
            disabled={saving || discharging}
          >
            Save
          </CustomButton>
          <CustomButton type="button" onClick={handleDischarge} disabled={saving || discharging}>
            Discharge
          </CustomButton>
        </div>
      </form>
      <DischargeDueConfirmModal
        open={dueConfirmOpen}
        onOpenChange={setDueConfirmOpen}
        dueAmount={Number(data?.dueAmount || 0)}
        pending={saving || discharging}
        onConfirm={form.handleSubmit(async (values) => {
          await completeDischarge(values);
        })}
      />
    </Form>
  );
};

export default IpdDischargeForm;
