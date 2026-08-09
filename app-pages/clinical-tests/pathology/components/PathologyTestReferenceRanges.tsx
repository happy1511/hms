"use client";

import { CustomAlert } from "@/components/common/CustomAlert";
import { CustomTable } from "@/components/common/CustomTable";
import { Button } from "@/components/ui/button";
import { ReferenceRange } from "@/generated/prisma/client";
import { useDeleteReferenceRange } from "@/hooks/query/pathology";
import { ColumnDefWithClass } from "@/lib/type";
import { fromDays } from "@/lib/utils";
import { Edit2, Trash2 } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { TableRowParameter } from "./PathologyTestParameterForm";
import PathologyTestReferenceRangeForm, {
  ParameterReferenceRangeItem,
} from "./PathologyTestReferenceRangeForm";

const ReferenceRangeActions = ({
  data,
  setEditingRange,
  testId,
  parameterId,
}: {
  data: ParameterReferenceRangeItem;
  testId: number;
  parameterId: number;
  setEditingRange: Dispatch<SetStateAction<ParameterReferenceRangeItem | null>>;
}) => {
  const { mutateAsync: deleteRange, isPending } = useDeleteReferenceRange(
    testId,
    parameterId,
  );

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

export const PathologyTestReferenceRanges = ({
  data,
  testId,
}: {
  data: TableRowParameter;
  testId: number;
}) => {
  const [editingRange, setEditingRange] =
    useState<ParameterReferenceRangeItem | null>(null);

  const columns: ColumnDefWithClass<ParameterReferenceRangeItem>[] = [
    {
      accessorKey: "applicableGender",
      header: "Gender",
    },
    {
      accessorKey: "lowerDay",
      header: "Lower Day",
      cell: ({ row }) => {
        return row.original.upperAgeInDays
          ? fromDays(row.original.upperAgeInDays || 0).days
          : "-";
      },
    },
    {
      accessorKey: "upperDay",
      header: "Upper Day",
      cell: ({ row }) => {
        return row.original.upperAgeInDays
          ? fromDays(row.original.upperAgeInDays || 0).days
          : "-";
      },
    },
    {
      accessorKey: "lowerMonth",
      header: "Lower Month",
      cell: ({ row }) => {
        return row.original.upperAgeInDays
          ? fromDays(row.original.lowerAgeInDays || 0).months
          : "-";
      },
    },
    {
      accessorKey: "upperMonth",
      header: "Upper Month",
      cell: ({ row }) => {
        return row.original.upperAgeInDays
          ? fromDays(row.original.upperAgeInDays || 0).months
          : "-";
      },
    },
    {
      accessorKey: "lowerYear",
      header: "Lower Year",
      cell: ({ row }) => {
        return row.original.upperAgeInDays
          ? fromDays(row.original.lowerAgeInDays || 0).years
          : "-";
      },
    },
    {
      accessorKey: "upperYear",
      header: "Upper Year",
      cell: ({ row }) => {
        return row.original.upperAgeInDays
          ? fromDays(row.original.upperAgeInDays || 0).years
          : "-";
      },
    },
    {
      accessorKey: "lowerRange",
      header: "Lower Range",
      cell: ({ row }) => {
        return row.original.lowerRange;
      },
    },
    {
      accessorKey: "upperRange",
      header: "Upper Range",
      cell: ({ row }) => {
        return row.original.upperRange;
      },
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
          testId={testId}
          parameterId={data.id}
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
        getRowId={(data) => String(data.id)}
        hidePagination
      />
      <PathologyTestReferenceRangeForm
        setEditingRange={setEditingRange}
        editingRange={editingRange}
        data={data}
        testId={testId}
      />
    </div>
  );
};

export default PathologyTestReferenceRanges;
