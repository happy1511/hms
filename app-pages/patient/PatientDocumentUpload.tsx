"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DocumentType, ModuleType, ActionType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { useCreatePatientDocument } from "@/hooks/query/patient";
import { hasActionPermission } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import z from "zod";

const formValidator = z.object({
  documentName: z.string().trim().min(1, "Document name is required"),
});

type FormValues = z.input<typeof formValidator>;

const PatientDocumentUpload = () => {
  const searchParams = useSearchParams();
  const { data: profile } = useProfile(false);
  const { mutateAsync: uploadDocument, isPending } = useCreatePatientDocument();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const opdId = Number(searchParams.get("opdId") || 0) || undefined;
  const ipdId = Number(searchParams.get("ipdId") || 0) || undefined;
  const patientName = searchParams.get("patientName") || "";
  const patientId = searchParams.get("patientId") || "";

  const recordLabel = useMemo(() => {
    if (opdId) return `OPD #${opdId}`;
    if (ipdId) return `IPD #${ipdId}`;
    return "";
  }, [opdId, ipdId]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formValidator),
    defaultValues: {
      documentName: "",
    },
  });

  if (!profile) {
    return <div />;
  }

  const canUploadOpdDocument = hasActionPermission(
    profile.data,
    ModuleType.OPD_BILL,
    ActionType.UPDATE,
  );
  const canUploadIpdDocument =
    hasActionPermission(profile.data, ModuleType.IPD_BILL, ActionType.UPDATE) ||
    hasActionPermission(profile.data, ModuleType.DAY_CARE_IPD, ActionType.UPDATE) ||
    hasActionPermission(
      profile.data,
      ModuleType.DISCHARGE_PATIENT,
      ActionType.UPDATE,
    );

  const canUpload = opdId ? canUploadOpdDocument : ipdId ? canUploadIpdDocument : false;

  const handleSubmit = async (values: FormValues) => {
    if (!selectedFile) {
      form.setError("documentName", {
        type: "manual",
        message: "Please select a file to upload",
      });
      return;
    }

    await uploadDocument({
      documentName: values.documentName,
      file: selectedFile,
      ...(opdId ? { opdId } : {}),
      ...(ipdId ? { ipdId } : {}),
    });

    setSelectedFile(null);
    form.reset({ documentName: "" });
  };

  return (
    <CustomLayout title="Upload Patient Document">
      {!canUpload && <NoPermission />}
      {canUpload && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 rounded-md border border-border bg-white p-4"
          >
            <div className="grid gap-3 md:grid-cols-2">
              <FormField<FormValues>
                type="select"
                control={form.control}
                name={"documentName"}
                label="Document Name"
                required
                placeholder="Select document type"
                options={Object.values(DocumentType).map((type) => ({
                  label: type,
                  value: type,
                }))}
              />
              <div className="space-y-1">
                <div className="font-semibold font-quicksand text-tiny">
                  Linked Record
                </div>
                <Input
                  readOnly
                  value={recordLabel || "-"}
                  className="h-6 border shadow-none text-tiny"
                />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <div className="font-semibold font-quicksand text-tiny">Patient</div>
                <Input
                  readOnly
                  value={patientName || "-"}
                  className="h-6 border shadow-none text-tiny"
                />
              </div>
              <div className="space-y-1">
                <div className="font-semibold font-quicksand text-tiny">UHID</div>
                <Input
                  readOnly
                  value={patientId || "-"}
                  className="h-6 border shadow-none text-tiny"
                />
              </div>
            </div>
            <div className="space-y-1">
              <div className="font-semibold font-quicksand text-tiny">
                Upload File
              </div>
              <Input
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                onChange={(event) =>
                  setSelectedFile(event.target.files?.[0] ?? null)
                }
                className="h-9 border shadow-none text-tiny"
              />
              <div className="text-[11px] text-muted-foreground">
                Accepted formats: PDF, JPG, PNG, WEBP
              </div>
            </div>
            <div className="flex justify-end">
              <CustomButton type="submit" disabled={isPending}>
                {isPending ? "Uploading..." : "Upload Document"}
              </CustomButton>
            </div>
          </form>
        </Form>
      )}
    </CustomLayout>
  );
};

export default PatientDocumentUpload;
