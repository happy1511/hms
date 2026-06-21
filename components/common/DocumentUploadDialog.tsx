"use client";

import CustomButton from "@/components/common/CustomButton";
import { MAX_DOCUMENT_SIZE_LABEL } from "@/lib/document";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";

const DocumentUploadDialog = ({
  open,
  onOpenChange,
  title,
  description,
  accept = "application/pdf,image/*",
  existingFileUrl,
  onUpload,
  uploading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  accept?: string;
  existingFileUrl?: string | null;
  onUpload: (file: File) => Promise<unknown>;
  uploading?: boolean;
}) => {
  const [file, setFile] = useState<File | null>(null);

  const fileLabel = useMemo(() => {
    if (!file) return "No file selected";
    return `${file.name} (${Math.ceil(file.size / 1024)} KB)`;
  }, [file]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setFile(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-lg border-secondary border-4 bg-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {existingFileUrl ? (
          <div className="text-xs">
            Current report:{" "}
            <a
              className="text-primary underline"
              href={existingFileUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open
            </a>
          </div>
        ) : null}

        <div className="space-y-2">
          <Input
            type="file"
            accept={accept}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <div className="text-xs text-muted-foreground">{fileLabel}</div>
          <div className="text-xs text-muted-foreground">
            Max file size: {MAX_DOCUMENT_SIZE_LABEL}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <CustomButton
            variant="outline"
            className="bg-transparent text-black"
            disabled={uploading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </CustomButton>
          <CustomButton
            disabled={!file || uploading}
            onClick={async () => {
              if (!file) return;
              await onUpload(file);
            }}
          >
            {uploading ? "Uploading..." : "Upload"}
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadDialog;
