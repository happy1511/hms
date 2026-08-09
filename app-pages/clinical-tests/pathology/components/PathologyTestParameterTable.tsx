"use client";

import { CustomAlert } from "@/components/common/CustomAlert";
import { CustomTable } from "@/components/common/CustomTable";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useDeletePathologyTestParameter,
  useDeletePathologyTestParameterHeader,
} from "@/hooks/query/pathology";
import { ColumnDefWithClass, PathologyTestDataType } from "@/lib/type";
import { Edit2, Trash2 } from "lucide-react";
import { SetStateAction, useState } from "react";
import ParameterOptionsModal from "../ParameterOptionsModal";
import PathologyTestHeaderForm, {
  TableRowHeader,
} from "./PathologyTestHeaderForm";
import PathologyTestParameterForm, {
  TableRowParameter,
} from "./PathologyTestParameterForm";
import PathologyTestReferenceRanges from "./PathologyTestReferenceRanges";

export type TableRow = TableRowHeader | TableRowParameter;

const ParameterAndHeaderActions = ({
  data,
  setEditingHeader,
  setEditingParameter,
  testId,
  setMode,
}: {
  data: TableRow;
  testId: number;
  setEditingHeader: (value: SetStateAction<TableRowHeader | null>) => void;
  setMode: (value: SetStateAction<"parameter" | "header">) => void;
  setEditingParameter: (
    value: SetStateAction<TableRowParameter | null>,
  ) => void;
}) => {
  const { mutateAsync: deleteParameter, isPending: deletingParameter } =
    useDeletePathologyTestParameter(testId);
  const { mutateAsync: deleteHeader, isPending: deletingHeader } =
    useDeletePathologyTestParameterHeader(testId);

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

export const PathologyTestParameterTable = ({
  data,
}: {
  data: PathologyTestDataType;
}) => {
  const [mode, setMode] = useState<"parameter" | "header">("parameter");
  const [selectedParameterId, setSelectedParameterId] =
    useState<number | null>(null);
  const [editingParameter, setEditingParameter] =
    useState<TableRowParameter | null>(null);
  const [editingHeader, setEditingHeader] = useState<TableRowHeader | null>(
    null,
  );

  const headerMap = new Set(data.testHeaders.map((h) => h.id));

  // 1. Group parameters under their headers
  const headerGroupRows: TableRow[] = data.testHeaders.flatMap((header) => [
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

  // 2. Parameters not associated with any header (placed at bottom with empty header row)
  const unassociatedParameters: TableRowParameter[] = data.parameters
    .filter((p) => !p.headerId || !headerMap.has(p.headerId))
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
    })) as TableRowParameter[];

  const emptyHeaderRow: TableRowHeader[] =
    unassociatedParameters.length > 0
      ? [
          {
            type: "header",
            id: -1,
            name: "",
            note: "",
            displayOrder: 0,
          },
        ]
      : [];

  const tableData: TableRow[] = [
    ...headerGroupRows,
    ...emptyHeaderRow,
    ...unassociatedParameters,
  ];

  const selectedParameter = tableData.find(
    (row): row is TableRowParameter =>
      row.type === "parameter" && row.id === selectedParameterId,
  );

  const [selectedOptionParameterId, setSelectedOptionParameterId] =
    useState<number | null>(null);

  const activeOptionParameter = data.parameters.find(
    (p) => p.id === selectedOptionParameterId,
  );

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
      cell: ({ row }) =>
        row.original.id === -1 ? "" : row.original.displayOrder,
    },
    {
      id: "ranges",
      header: "Ranges",
      cell: ({ row }) => (
        <>
          {row.original.type !== "header" && (
            <Button
              variant="outline"
              className="h-auto shadow-none p-0 border-none bg-transparent cursor-pointer text-[8px]"
              onClick={() => {
                setSelectedParameterId(row.original.id);
              }}
            >
              Ranges
            </Button>
          )}
        </>
      ),
    },
    {
      id: "options",
      header: "Options",
      cell: ({ row }) => (
        <>
          {row.original.type !== "header" && (
            <Button
              variant="outline"
              className="h-auto shadow-none p-0 border-none bg-transparent cursor-pointer text-[8px]"
              onClick={() => {
                setSelectedOptionParameterId(row.original.id);
              }}
            >
              Options
            </Button>
          )}
        </>
      ),
    },
    {
      id: "actions",
      header: "Edit",
      cell: ({ row }) =>
        row.original.id === -1 ? null : (
          <ParameterAndHeaderActions
            data={row.original}
            setEditingHeader={setEditingHeader}
            setEditingParameter={setEditingParameter}
            setMode={setMode}
            testId={data.id}
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
        <PathologyTestParameterForm
          setEditingParameter={setEditingParameter}
          testId={data.id}
          testHeaders={data.testHeaders}
          editingParameter={editingParameter}
        />
      )}

      {mode === "header" && (
        <PathologyTestHeaderForm
          setEditingHeader={setEditingHeader}
          testId={data.id}
          editingHeader={editingHeader}
        />
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-3">
          <p className="text-md">Parameters</p>
          <CustomTable
            columns={columns}
            data={tableData}
            getRowId={(data) => `${data.type}_${data.id}`}
            hidePagination
          />
        </div>
        {selectedParameter && (
          <PathologyTestReferenceRanges
            data={selectedParameter}
            testId={data.id}
          />
        )}
      </div>

      {activeOptionParameter && (
        <ParameterOptionsModal
          open={!!selectedOptionParameterId}
          onOpenChange={(open) => {
            if (!open) setSelectedOptionParameterId(null);
          }}
          testId={data.id}
          data={activeOptionParameter}
        />
      )}
    </div>
  );
};

export default PathologyTestParameterTable;
