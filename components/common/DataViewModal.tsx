import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Copy, Check, Eye } from "lucide-react";

type Primitive = string | number | boolean;
type RenderableValue =
  | Primitive
  | Primitive[]
  | Date
  | Record<string, unknown>
  | unknown[];

export interface DataViewField<T> {
  key: keyof T;
  label: string;
}

interface DataViewModalProps<T extends object> {
  data: T;
  fields: DataViewField<T>[];
  title?: string;

  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function DataViewModal<T extends object>({
  data,
  fields,
  title = "Data View",
  open,
  onOpenChange,
  trigger,
}: DataViewModalProps<T>) {
  const [copiedKey, setCopiedKey] = React.useState<keyof T | null>(null);

  const stringifyValue = (value: RenderableValue): string => {
    if (value instanceof Date) {
      return value.toISOString();
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => stringifyValue(item as RenderableValue))
        .join(", ");
    }

    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value, null, 2);
    }

    return String(value);
  };

  const handleCopy = async (key: keyof T, value: RenderableValue) => {
    await navigator.clipboard.writeText(stringifyValue(value));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            className="h-auto shadow-none p-1 cursor-pointer"
          >
            <Eye className="size-2.5 text-destructive" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-black/60 text-sm">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[70dvh] overflow-y-auto">
          {fields.map((field) => {
            const value = data[field.key] as RenderableValue;

            return (
              <div key={String(field.key)} className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-tiny font-medium text-muted-foreground">
                      {field.label}
                    </p>

                    <pre className="mt-1 text-sm whitespace-pre-wrap break-all">
                      {stringifyValue(value)}
                    </pre>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(field.key, value)}
                  >
                    {copiedKey === field.key ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <Separator />
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
