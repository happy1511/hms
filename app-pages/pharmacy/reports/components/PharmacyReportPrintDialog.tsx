"use client";

import CustomButton from "@/components/common/CustomButton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FilterValues } from "@/lib/type";
import { PrinterIcon } from "lucide-react";
import { useMemo, useState } from "react";

export type PharmacyReportPrintConfig = {
  reportKey: string;
  tableKey: string;
  title: string;
  filters: FilterValues;
};

const formatDateParam = (value?: Date) =>
  value instanceof Date && !Number.isNaN(value.getTime())
    ? value.toISOString()
    : "";

const PharmacyReportPrintDialog = ({
  config,
}: {
  config: PharmacyReportPrintConfig;
}) => {
  const [open, setOpen] = useState(false);
  const [includeAllData, setIncludeAllData] = useState(false);
  const [rowLimit, setRowLimit] = useState("25");

  const resolvedLimit = useMemo(() => {
    const parsed = Number(rowLimit);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
  }, [rowLimit]);

  const handlePrint = () => {
    if (!includeAllData && resolvedLimit < 1) {
      return;
    }

    const params = new URLSearchParams({
      reportKey: config.reportKey,
      tableKey: config.tableKey,
      includeAll: includeAllData ? "true" : "false",
    });

    if (!includeAllData) {
      params.set("limit", String(resolvedLimit));
    }

    const createdAt = config.filters.createdAt;
    if (createdAt && typeof createdAt === "object") {
      const from = formatDateParam(createdAt.from);
      const to = formatDateParam(createdAt.to);
      if (from) params.set("createdAt[from]", from);
      if (to) params.set("createdAt[to]", to);
    }

    window.open(`/pharmacy/reports/print?${params.toString()}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <CustomButton type="button" variant="secondary">
          <PrinterIcon className="mr-2 size-4" />
          Print
        </CustomButton>
      </DialogTrigger>
      <DialogContent className="max-w-md border-secondary border-4 bg-white">
        <DialogHeader>
          <DialogTitle className="text-sm text-black/70">
            Print {config.title}
          </DialogTitle>
          <DialogDescription>
            Choose how many rows to include in the printed report.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={includeAllData}
              onCheckedChange={(checked) => setIncludeAllData(Boolean(checked))}
            />
            Include all data
          </label>

          <div className="space-y-2">
            <div className="text-sm font-medium">Number of rows</div>
            <Input
              type="number"
              min={1}
              disabled={includeAllData}
              value={rowLimit}
              onChange={(event) => setRowLimit(event.target.value)}
              className="h-8 text-sm"
              placeholder="Enter row count"
            />
          </div>
        </div>

        <DialogFooter>
          <CustomButton type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </CustomButton>
          <CustomButton
            type="button"
            onClick={handlePrint}
            disabled={!includeAllData && resolvedLimit < 1}
          >
            Continue
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PharmacyReportPrintDialog;
