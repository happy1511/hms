"use client";

import { CustomAlert } from "@/components/common/CustomAlert";
import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import { CustomTable } from "@/components/common/CustomTable";
import FormField from "@/components/form-inputs/FormField";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import { ParameterOptions, ReferenceRange } from "@/generated/prisma/client";
import {
  ContainerType,
  PathologyTestSection,
  ReferenceRangeSex,
  SampleType,
} from "@/generated/prisma/enums";
import {
  useCreateReferenceRange,
  useCreateTestParameter,
  useCreateTestParameterHeader,
  useDeletePathologyTestParameter,
  useDeletePathologyTestParameterHeader,
  useDeleteReferenceRange,
  useGetPathologyTest,
  useUpdatePathologyTest,
  useUpdateReferenceRange,
  useUpdateTestParameter,
  useUpdateTestParameterHeader,
} from "@/hooks/query/pathology";
import { ColumnDefWithClass, PathologyTestDataType } from "@/lib/type";
import {
  addParameterHeaderToTestValidator,
  AddParameterHeaderToTestValidatorType,
  addParameterToTestValidator,
  AddParameterToTestValidatorType,
  addReferenceRangeToParameterValidator,
  AddReferenceRangeToParameterValidatorType,
  partialPathologyTestValidator,
  PartialPathologyTestValidatorType,
} from "@/validators/api/masters/pathologyTest";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit2, LoaderIcon, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import ParameterOptionsModal from "./ParameterOptionsModal";

type TableRowHeader = {
  type: "header";
  id: number;
  name: string;
  note?: string;
  displayOrder: number;
};
type TableRowParameter = {
  type: "parameter";
  id: number;
  name: string;
  headerId: number;
  isDescriptiveOnly: boolean;
  displayOrder: number;
  referenceRanges: ReferenceRange[];
  parameterOptions: ParameterOptions[];
};

type TableRow = TableRowHeader | TableRowParameter;

const TestInfoForm = ({ data }: { data: PathologyTestDataType }) => {
  const { mutateAsync, isPending } = useUpdatePathologyTest();
  const { alias, container, footerNotes, name, price, sampleType, section } =
    data;

  const form = useForm<PartialPathologyTestValidatorType>({
    defaultValues: {
      alias,
      container,
      footerNotes,
      name,
      price,
      sampleType,
      section,
    },
    resolver: zodResolver(partialPathologyTestValidator),
  });

  const handleSubmit = (values: PartialPathologyTestValidatorType) => {
    mutateAsync(values);
  };

  return (
    <Form {...form}>
      <form
        className="grid grid-cols-2 space-x-2"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FormField
          label="Name"
          type="text"
          control={form.control}
          name="name"
          placeholder="Enter Name"
          required
        />
        <FormField
          label="Alias"
          type="text"
          control={form.control}
          placeholder="Enter Alias"
          name="alias"
          required
        />
        <FormField
          label="Section"
          type="select"
          control={form.control}
          name="section"
          options={Object.values(PathologyTestSection).map((s) => ({
            value: s,
            label: s,
          }))}
          required
        />
        <FormField
          label="Vial"
          type="select"
          control={form.control}
          name="container"
          options={Object.values(ContainerType).map((s) => ({
            value: s,
            label: s,
          }))}
          required
        />
        <FormField
          label="Sample Type"
          type="select"
          control={form.control}
          name="sampleType"
          options={Object.values(SampleType).map((s) => ({
            value: s,
            label: s,
          }))}
          required
        />
        <FormField
          label="Rate"
          type="number"
          control={form.control}
          name="price"
          required
        />
        <div className="col-span-2">
          <FormField
            label="Footer Notes"
            type="textarea"
            control={form.control}
            name="footerNotes"
          />
        </div>

        <div className="col-span-2">
          <CustomButton disabled={isPending} type="submit">
            Save
          </CustomButton>
        </div>
      </form>
    </Form>
  );
};

const HeaderForm = ({
  editingHeader,
  data,
  setEditingHeader,
}: {
  editingHeader: TableRowHeader | null;
  data: PathologyTestDataType;
  setEditingHeader: Dispatch<SetStateAction<TableRowHeader | null>>;
}) => {
  const { mutateAsync: createHeader, isPending: creatingHeader } =
    useCreateTestParameterHeader();

  const { mutateAsync: updateHeader, isPending: updatingHeader } =
    useUpdateTestParameterHeader();

  const headerForm = useForm<AddParameterHeaderToTestValidatorType>({
    defaultValues: { testId: data.id },
    resolver: zodResolver(addParameterHeaderToTestValidator),
  });

  const handleHeaderSubmit = async (
    values: AddParameterHeaderToTestValidatorType,
  ) => {
    if (editingHeader) {
      await updateHeader({ headerId: editingHeader.id, ...values });
    } else {
      await createHeader(values);
    }

    setEditingHeader(null);
    headerForm.reset({ testId: data.id });
  };

  useEffect(() => {
    if (!editingHeader) return;

    headerForm.reset({
      testId: data.id,
      name: editingHeader.name,
      note: editingHeader.note ?? "",
      displayOrder: editingHeader.displayOrder.toString(),
    });
  }, [editingHeader]);

  return (
    <Form {...headerForm}>
      <form
        onSubmit={headerForm.handleSubmit(handleHeaderSubmit)}
        className="grid grid-cols-2 gap-2"
      >
        <FormField
          label="Name"
          name="name"
          type="text"
          control={headerForm.control}
          required
        />

        <FormField
          label="Display Order"
          name="displayOrder"
          type="select"
          control={headerForm.control}
          options={[...Array(25)].map((_, i) => ({
            value: i.toString(),
            label: i.toString(),
          }))}
          required
        />

        <div className="col-span-2">
          <FormField
            label="Note"
            name="note"
            type="textarea"
            control={headerForm.control}
          />
        </div>

        <div className="col-span-2">
          <CustomButton
            type="submit"
            disabled={creatingHeader || updatingHeader}
          >
            {editingHeader ? "Update Header" : "Add Header"}
          </CustomButton>
        </div>
      </form>
    </Form>
  );
};

const ParameterForm = ({
  editingParameter,
  data,
  setEditingParameter,
}: {
  editingParameter: TableRowParameter | null;
  data: PathologyTestDataType;
  setEditingParameter: Dispatch<SetStateAction<TableRowParameter | null>>;
}) => {
  const { mutateAsync: createParameter, isPending: creatingParameter } =
    useCreateTestParameter();

  const { mutateAsync: updateParameter, isPending: updatingParameter } =
    useUpdateTestParameter();

  const parameterForm = useForm<AddParameterToTestValidatorType>({
    defaultValues: { testId: data.id },
    resolver: zodResolver(addParameterToTestValidator),
  });

  useEffect(() => {
    if (!editingParameter) return;

    parameterForm.reset({
      testId: data.id,
      name: editingParameter.name,
      displayOrder: editingParameter.displayOrder.toString(),
      headerId: editingParameter.headerId?.toString(),
      isDescriptiveOnly: editingParameter.isDescriptiveOnly,
    });
  }, [editingParameter]);

  const handleParameterSubmit = async (
    values: AddParameterToTestValidatorType,
  ) => {
    if (editingParameter) {
      await updateParameter({
        parameterId: editingParameter.id,
        ...values,
      });
    } else {
      await createParameter(values);
    }

    setEditingParameter(null);
    parameterForm.reset({ testId: data.id });
  };
  return (
    <Form {...parameterForm}>
      <form
        onSubmit={parameterForm.handleSubmit(handleParameterSubmit)}
        className="grid grid-cols-2 gap-2"
      >
        <FormField
          label="Name"
          name="name"
          type="text"
          control={parameterForm.control}
          required
        />

        <FormField
          label="Display Order"
          name="displayOrder"
          type="select"
          control={parameterForm.control}
          options={[...Array(25)].map((_, i) => ({
            value: i.toString(),
            label: i.toString(),
          }))}
          required
        />

        <FormField
          label="Header"
          name="headerId"
          type="select"
          control={parameterForm.control}
          options={data.testHeaders.map((h) => ({
            value: h.id.toString(),
            label: h.name,
          }))}
          required
        />

        <FormField
          label="Descriptive Only"
          name="isDescriptiveOnly"
          type="checkbox"
          control={parameterForm.control}
        />

        <div className="col-span-2">
          <CustomButton
            type="submit"
            disabled={creatingParameter || updatingParameter}
          >
            {editingParameter ? "Update Parameter" : "Add Parameter"}
          </CustomButton>
        </div>
      </form>
    </Form>
  );
};

const ReferenceRangeForm = ({
  editingRange,
  data,
  setEditingRange,
}: {
  editingRange: ReferenceRange | null;
  data: TableRowParameter;
  setEditingRange: Dispatch<SetStateAction<ReferenceRange | null>>;
}) => {
  const { mutateAsync: create, isPending: creating } =
    useCreateReferenceRange();

  const { mutateAsync: update, isPending: updating } =
    useUpdateReferenceRange();

  const form = useForm<AddReferenceRangeToParameterValidatorType>({
    defaultValues: { parameterId: data.id },
    resolver: zodResolver(addReferenceRangeToParameterValidator),
  });

  useEffect(() => {
    if (!editingRange) return;

    form.reset({
      ...editingRange,
    });
  }, [editingRange]);

  const handleSubmit = async (
    values: AddReferenceRangeToParameterValidatorType,
  ) => {
    if (editingRange) {
      await update({
        referenceRangeId: editingRange.id,
        ...values,
      });
    } else {
      await create(values);
    }

    setEditingRange(null);
    form.reset({});
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="grid grid-cols-2 space-x-2">
          <FormField
            label="Lower Day"
            name="lowerDay"
            type="text"
            control={form.control}
          />
          <FormField
            label="Upper Day"
            name="upperDay"
            type="text"
            control={form.control}
          />
          <FormField
            label="Lower Month"
            name="lowerMonth"
            type="text"
            control={form.control}
          />
          <FormField
            label="Upper Month"
            name="upperMonth"
            type="text"
            control={form.control}
          />
          <FormField
            label="Lower Year"
            name="lowerYear"
            type="text"
            control={form.control}
          />
          <FormField
            label="Upper Year"
            name="upperYear"
            type="text"
            control={form.control}
          />
          <FormField
            label="Lower Range"
            name="lowerRange"
            type="text"
            control={form.control}
          />
          <FormField
            label="Upper Range"
            name="upperRange"
            type="text"
            control={form.control}
          />
          <FormField
            label="Sex"
            name="applicableGender"
            type="select"
            control={form.control}
            options={Object.values(ReferenceRangeSex).map((s) => ({
              value: s,
              label: s,
            }))}
            required
          />
          <FormField
            label="Unit"
            name="unit"
            type="text"
            control={form.control}
          />
        </div>
        <div className="col-span-2">
          <CustomButton type="submit" disabled={creating || updating}>
            {editingRange ? "Update Range" : "Add Range"}
          </CustomButton>
        </div>
      </form>
    </Form>
  );
};

const ReferenceRangeActions = ({
  data,
  setEditingRange,
}: {
  data: ReferenceRange;
  setEditingRange: Dispatch<SetStateAction<ReferenceRange | null>>;
}) => {
  const { mutateAsync: deleteRange, isPending } = useDeleteReferenceRange();

  return (
    <>
      <Button
        variant="outline"
        className="h-auto shadow-none p-1 cursor-pointer"
        onClick={() => {
          setEditingRange(data);
        }}
      >
        <Edit2 className="size-2" />
      </Button>
      <CustomAlert
        triggerButton={
          <Button
            variant="outline"
            className="h-auto shadow-none p-1 cursor-pointer"
          >
            <Trash2 className="size-2 text-destructive" />
          </Button>
        }
        title="Delete Range?"
        description="Are you sure you want to delete it?"
        cancelText="Cancel"
        confirmText="Delete"
        handleConfirm={() => deleteRange({ referenceRangeId: data.id })}
        pending={isPending}
      />
    </>
  );
};

const ReferenceRanges = ({ data }: { data: TableRowParameter }) => {
  const [editingRange, setEditingRange] = useState<ReferenceRange | null>(null);

  const columns: ColumnDefWithClass<ReferenceRange>[] = [
    {
      accessorKey: "applicableGender",
      header: "Gender",
    },
    {
      accessorKey: "lowerDay",
      header: "Lower Day",
    },
    {
      accessorKey: "upperDay",
      header: "Upper Day",
    },
    {
      accessorKey: "lowerMonth",
      header: "Lower Month",
    },
    {
      accessorKey: "upperMonth",
      header: "Upper Month",
    },
    {
      accessorKey: "lowerYear",
      header: "Lower Year",
    },
    {
      accessorKey: "upperYear",
      header: "Upper Year",
    },
    {
      accessorKey: "lowerRange",
      header: "Lower Range",
    },
    {
      accessorKey: "upperRange",
      header: "Upper Range",
    },

    {
      accessorKey: "unit",
      header: "unit",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <ReferenceRangeActions
          data={row.original}
          setEditingRange={setEditingRange}
        />
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-md">Parameter Range</p>
      <p className="text-sm bg-secondary text-white text-center">
        Range For - {data.name}
      </p>
      <CustomTable
        columns={columns}
        data={data.referenceRanges || []}
        hidePagination
      />
      <ReferenceRangeForm
        setEditingRange={setEditingRange}
        editingRange={editingRange}
        data={data}
      />
    </div>
  );
};

const ParameterAndHeaderActions = ({
  data,
  setEditingHeader,
  setEditingParameter,
  setMode,
}: {
  data: TableRow;
  setEditingHeader: (value: SetStateAction<TableRowHeader | null>) => void;
  setMode: (value: SetStateAction<"parameter" | "header">) => void;
  setEditingParameter: (
    value: SetStateAction<TableRowParameter | null>,
  ) => void;
}) => {
  const { mutateAsync: deleteParameter, isPending: deletingParameter } =
    useDeletePathologyTestParameter();
  const { mutateAsync: deleteHeader, isPending: deletingHeader } =
    useDeletePathologyTestParameterHeader();

  return (
    <>
      <Button
        variant="outline"
        className="h-auto shadow-none p-1 cursor-pointer"
        onClick={() => {
          if (data.type === "header") {
            setEditingHeader(data);
            setMode("header");
          } else {
            setEditingParameter(data);
            setMode("parameter");
          }
        }}
      >
        <Edit2 className="size-2" />
      </Button>
      <CustomAlert
        triggerButton={
          <Button
            variant="outline"
            className="h-auto shadow-none p-1 cursor-pointer"
          >
            <Trash2 className="size-2 text-destructive" />
          </Button>
        }
        title={data.type === "header" ? "Delete Header?" : "Delete Parameter?"}
        description="Are you sure you want to delete it?"
        cancelText="Cancel"
        confirmText="Delete"
        handleConfirm={() =>
          data.type === "header"
            ? deleteHeader({ headerId: data.id })
            : deleteParameter({ parameterId: data.id })
        }
        pending={deletingHeader || deletingParameter}
      />
    </>
  );
};

const TestParameterAndHeaderForm = ({
  data,
}: {
  data: PathologyTestDataType;
}) => {
  const [mode, setMode] = useState<"parameter" | "header">("parameter");
  const [selectedParameter, setSelectedParameter] =
    useState<TableRowParameter | null>(null);
  const [editingParameter, setEditingParameter] =
    useState<TableRowParameter | null>(null);
  const [editingHeader, setEditingHeader] = useState<TableRowHeader | null>(
    null,
  );

  const tableData: TableRow[] = data.testHeaders.flatMap((header) => [
    {
      type: "header",
      id: header.id,
      name: header.name,
      note: header.note,
      displayOrder: header.displayOrder,
    } as TableRowHeader,
    ...(data.parameters
      .filter((p) => p.headerId === header.id)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((p) => ({
        type: "parameter",
        id: p.id,
        name: p.name,
        headerId: p.headerId,
        isDescriptiveOnly: p.isDescriptiveOnly,
        displayOrder: p.displayOrder,
        referenceRanges: p.referenceRanges,
        parameterOptions: p.parameterOptions,
      })) as TableRowParameter[]),
  ]);

  const columns: ColumnDefWithClass<TableRow>[] = [
    {
      accessorKey: "name",
      header: "Parameter",
      cell: ({ row }) =>
        row.original.type === "header" ? "" : row.original.name,
    },
    {
      accessorKey: "name",
      header: "Header",
      cell: ({ row }) =>
        row.original.type === "header" ? row.original.name : "",
    },

    {
      accessorKey: "displayOrder",
      header: "Order",
    },
    {
      id: "action1s",
      header: "Ranges",
      cell: ({ row }) => (
        <>
          {row.original.type !== "header" && (
            <Button
              variant="outline"
              className="h-auto shadow-none p-0 border-none bg-transparent cursor-pointer text-[8px]"
              onClick={() => {
                setSelectedParameter(row.original as TableRowParameter);
              }}
            >
              Ranges
            </Button>
          )}
        </>
      ),
    },
    {
      id: "action1s",
      header: "Options",
      cell: ({ row }) => (
        <>
          {row.original.type !== "header" && (
            <ParameterOptionsModal
              trigger={
                <Button
                  variant="outline"
                  className="h-auto shadow-none p-0 border-none bg-transparent cursor-pointer text-[8px]"
                >
                  Options
                </Button>
              }
              data={row.original}
            />
          )}
        </>
      ),
    },
    {
      id: "actions",
      header: "Edit",
      cell: ({ row }) => (
        <ParameterAndHeaderActions
          data={row.original}
          setEditingHeader={setEditingHeader}
          setEditingParameter={setEditingParameter}
          setMode={setMode}
        />
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={mode === "header"}
          onCheckedChange={(v) => setMode(v ? "header" : "parameter")}
        />
        <p className="text-tiny">Header mode</p>
      </div>

      {mode === "parameter" && (
        <ParameterForm
          setEditingParameter={setEditingParameter}
          data={data}
          editingParameter={editingParameter}
        />
      )}

      {mode === "header" && (
        <HeaderForm
          setEditingHeader={setEditingHeader}
          data={data}
          editingHeader={editingHeader}
        />
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-3">
          <p className="text-md">Parameters</p>
          <CustomTable columns={columns} data={tableData} hidePagination />
        </div>
        {selectedParameter && <ReferenceRanges data={selectedParameter} />}
      </div>
    </div>
  );
};

const EditPathologyTestForm = () => {
  const { testId }: { testId?: string } = useParams();

  const { data, isLoading: fetchingBed } = useGetPathologyTest(testId);

  if (fetchingBed) {
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

  if (testId && !data) {
    return <></>;
  }

  return (
    <div className="space-y-2">
      <CustomLayout title="Test Information">
        <TestInfoForm data={data as PathologyTestDataType} />
      </CustomLayout>

      <CustomLayout title="Test Parameters">
        <TestParameterAndHeaderForm data={data as PathologyTestDataType} />
      </CustomLayout>
    </div>
  );
};

export default EditPathologyTestForm;
