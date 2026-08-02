"use client";

import CustomButton from "@/components/common/CustomButton";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useGetGrn } from "@/hooks/query/pharmacyGrn";
import { LoaderIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";
import { Button } from "../ui/button";
import GrnPrintExport, { mapGrnToPrintExportProps } from "./GrnPrintExport";

interface Props {
  grnId: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

const ViewGrnModal = ({ grnId, open, onOpenChange, trigger }: Props) => {
  const router = useRouter();
  const { data, isLoading } = useGetGrn(String(grnId));

  const previewData = useMemo(() => {
    if (!data) return null;
    return mapGrnToPrintExportProps(data);
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="h-auto shadow-none p-1 cursor-pointer">
            <PlusIcon className="size-2.5 text-destructive" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-[98vw]! border-secondary border-4 bg-white h-[95dvh] flex flex-col p-4">
        <div className="text-sm font-medium">GRN</div>

        <div className="mt-3 flex-1 overflow-auto bg-[#e8e8e8]">
          {isLoading || !previewData ? (
            <div className="flex h-full w-full items-center justify-center">
              <LoaderIcon className="size-4 animate-spin" />
            </div>
          ) : (
            <GrnPrintExport
              {...previewData}
              showToolbar={false}
              title={`GRN View - ${previewData.supplierName} - GRN Number: ${previewData.grnNumber}`}
              className="min-h-full"
            />
          )}
        </div>

        <div className="mt-3 flex justify-center gap-2">
          <CustomButton
            type="button"
            onClick={() => {
              onOpenChange?.(false);
              router.push(`/pharmacy/grn/print/${grnId}`);
            }}
          >
            Print
          </CustomButton>
          <CustomButton
            type="button"
            className="bg-destructive"
            onClick={() => onOpenChange?.(false)}
          >
            Close
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewGrnModal;
