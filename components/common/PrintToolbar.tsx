"use client";

import CustomButton from "@/components/common/CustomButton";
import { cn } from "@/lib/utils";
import { PrinterIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface PrintToolbarProps {
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  onPrint?: () => void;
  className?: string;
  label?: string;
}

const FONT_SIZE_OPTIONS = [8, 9, 10, 11, 12, 13, 14, 16, 18];

const PrintToolbar = ({
  fontSize,
  onFontSizeChange,
  onPrint = () => window.print(),
  className = "",
  label = "Font size",
}: PrintToolbarProps) => {
  return (
    <div
      className={cn(
        "sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b bg-white px-4 py-3 print:hidden",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-tiny">
        <label className="font-medium text-gray-700" htmlFor="print-font-size">
          {label}
        </label>
        <Select
          value={fontSize.toString()}
          onValueChange={(value) => onFontSizeChange(Number(value))}
        >
          <SelectTrigger className="text-tiny h-auto!" id="print-font-size">
            <SelectValue className="text-tiny" placeholder="Select font size" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {FONT_SIZE_OPTIONS.map((size) => (
                <SelectItem
                  key={size}
                  className="text-tiny"
                  value={size.toString()}
                >
                  {size}px
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <CustomButton type="button" onClick={onPrint} className="ml-auto">
        <PrinterIcon className="mr-2 size-4" />
        Print
      </CustomButton>
    </div>
  );
};

export default PrintToolbar;
