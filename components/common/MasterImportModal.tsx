"use client";

import CustomButton from "@/components/common/CustomButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MASTER_IMPORT_CONFIG, MasterImportKey, MasterImportMode } from "@/lib/masterImportConfig";
import { useImportMasterData } from "@/hooks/query/masterImport";
import { DownloadIcon, UploadIcon } from "lucide-react";
import { useMemo, useState } from "react";

const csvEscape = (value: string | number | boolean | null | undefined) => {
  const normalized = value === null || value === undefined ? "" : String(value);
  if (
    normalized.includes(",") ||
    normalized.includes("\"") ||
    normalized.includes("\n")
  ) {
    return `"${normalized.replaceAll("\"", "\"\"")}"`;
  }
  return normalized;
};

const downloadExampleFile = (master: MasterImportKey) => {
  const config = MASTER_IMPORT_CONFIG[master];
  const headers = config.columns.map((column) => column.key).join(",");
  const example = config.columns
    .map((column) => csvEscape(column.example))
    .join(",");
  const csvContent = `\uFEFF${headers}\n${example}\n`;
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${master}-import-example.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

const ModeOption = ({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) => (
  <label className="flex cursor-pointer items-start gap-2 rounded border p-3 text-sm">
    <input type="radio" checked={checked} onChange={onChange} className="mt-1" />
    <span>
      <span className="block font-medium">{label}</span>
      <span className="block text-muted-foreground">{description}</span>
    </span>
  </label>
);

const MasterImportModal = ({
  master,
  allowReplace,
}: {
  master: MasterImportKey;
  allowReplace: boolean;
}) => {
  const config = MASTER_IMPORT_CONFIG[master];
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<MasterImportMode>("append");
  const [file, setFile] = useState<File | null>(null);
  const { mutateAsync, isPending } = useImportMasterData(master);

  const requiredColumns = useMemo(
    () => config.columns.filter((column) => column.required).map((column) => column.key),
    [config.columns],
  );

  const handleImport = async () => {
    if (!file) return;
    await mutateAsync({ file, mode });
    setOpen(false);
    setFile(null);
    setMode("append");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <CustomButton type="button" variant="secondary">
          Import
        </CustomButton>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-sm">
            Import {config.title} From Excel-Friendly CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="rounded border bg-muted/30 p-3">
            <p className="font-medium">Required columns</p>
            <p className="mt-1 text-muted-foreground">
              {requiredColumns.length ? requiredColumns.join(", ") : "No required columns"}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <ModeOption
              label="Append Data"
              description="Create new rows and update matching existing rows from the file."
              checked={mode === "append"}
              onChange={() => setMode("append")}
            />
            {allowReplace && (
              <ModeOption
                label="Replace Data"
                description="Mark current records as deleted first, then add the uploaded rows as fresh records."
                checked={mode === "replace"}
                onChange={() => setMode("replace")}
              />
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <CustomButton type="button" variant="outline" onClick={() => downloadExampleFile(master)}>
              <DownloadIcon className="mr-1 size-4" />
              Download Example File
            </CustomButton>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded border px-3 py-2">
              <UploadIcon className="size-4" />
              <span>{file?.name || "Choose CSV File"}</span>
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className="rounded border bg-muted/30 p-3 text-xs text-muted-foreground">
            Use the downloaded CSV as an Excel template. Open it in Excel, edit the rows, save as CSV, then upload it here.
          </div>

          <div className="flex justify-end gap-2">
            <CustomButton type="button" variant="outline" onClick={() => setOpen(false)}>
              Close
            </CustomButton>
            <CustomButton type="button" disabled={!file} isLoading={isPending} onClick={handleImport}>
              Import
            </CustomButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MasterImportModal;
