"use client";

import CustomButton from "@/components/common/CustomButton";
import CustomLayout from "@/components/common/CustomLayout";
import CustomTabs from "@/components/common/CustomTabs";
import NoPermission from "@/components/common/NoPermission";
import { SortableHeader } from "@/components/common/SortableHeader";
import { CustomTable } from "@/components/common/CustomTable";
import FormField from "@/components/form-inputs/FormField";
import { Form } from "@/components/ui/form";
import { CertificateType, ActionType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import {
  useCertificateTemplates,
  useCertificatesList,
  useCreateCertificate,
  useSaveCertificateTemplate,
} from "@/hooks/query/certificate";
import { useGetConsultationFile } from "@/hooks/query/opd";
import {
  CertificateTemplateMap,
  ColumnDefWithClass,
  FilterValues,
  OpdCertificateType,
} from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const CERTIFICATES_MODULE = "CERTIFICATES" as ModuleType;

const certificateTabs = [
  { value: CertificateType.MEDICAL, name: "Medical Certificate" },
  { value: CertificateType.FITNESS, name: "Fitness Certificate" },
] as const;

const contentValidator = z.object({
  content: z.string().trim().min(1, "Certificate content is required"),
});

type ContentFormValues = z.input<typeof contentValidator>;

const defaultTemplates: CertificateTemplateMap = {
  [CertificateType.MEDICAL]: "",
  [CertificateType.FITNESS]: "",
};

const replaceTemplateTokens = (content: string, consultation: any) => {
  const patient = consultation?.patient;
  const patientName = [
    patient?.firstName,
    patient?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const replacements: Record<string, string> = {
    "{{patientName}}": patientName || "",
    "{{uhid}}": String(patient?.id ?? ""),
    "{{gender}}": String(patient?.gender ?? ""),
    "{{age}}": "",
    "{{date}}": format(new Date(), "dd/MM/yyyy"),
    "{{dateTime}}": format(new Date(), "dd/MM/yyyy hh:mm a"),
    "{{opdNumber}}": String(consultation?.opdId ?? ""),
    "{{consultantDoctor}}": String(consultation?.consultantDoctorName ?? ""),
    "{{referredBy}}": String(consultation?.referringDoctorName ?? ""),
  };

  return Object.entries(replacements).reduce(
    (result, [token, value]) => result.split(token).join(value),
    content,
  );
};

const Certificates = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const opdId = Number(searchParams.get("opdId") || 0) || undefined;
  const initialTab =
    searchParams.get("tab") === CertificateType.FITNESS
      ? CertificateType.FITNESS
      : CertificateType.MEDICAL;

  const [activeTab, setActiveTab] = useState<CertificateType>(initialTab);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: profile } = useProfile(false);
  const { data: templatesData, isLoading: templatesLoading } =
    useCertificateTemplates();
  const { mutateAsync: saveTemplate, isPending: savingTemplate } =
    useSaveCertificateTemplate();
  const { mutateAsync: createCertificate, isPending: creatingCertificate } =
    useCreateCertificate();
  const { data: consultation, isLoading: consultationLoading } =
    useGetConsultationFile(opdId ? String(opdId) : undefined);
  const {
    data: certificateList,
    isLoading: listLoading,
    isError,
    error,
  } = useCertificatesList(
    {
      ...(opdId ? { opdId } : {}),
      documentType: activeTab,
    } as FilterValues,
    page,
    limit,
    Boolean(opdId),
  );

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentValidator),
    defaultValues: { content: "" },
  });

  const templates = templatesData || defaultTemplates;
  const canView = Boolean(
    profile &&
      hasActionPermission(profile.data, CERTIFICATES_MODULE, ActionType.VIEW),
  );
  const canCreate = Boolean(
    profile &&
      hasActionPermission(profile.data, CERTIFICATES_MODULE, ActionType.CREATE),
  );
  const canUpdate = Boolean(
    profile &&
      hasActionPermission(profile.data, CERTIFICATES_MODULE, ActionType.UPDATE),
  );
  const canPrint = Boolean(
    profile &&
      hasActionPermission(profile.data, CERTIFICATES_MODULE, ActionType.PRINT),
  );

  const resolvedTemplateContent = useMemo(() => {
    const base = templates[activeTab] || "";
    if (!opdId) return base;
    return replaceTemplateTokens(base, consultation);
  }, [activeTab, consultation, opdId, templates]);

  useEffect(() => {
    form.reset({ content: resolvedTemplateContent });
    setPage(1);
  }, [activeTab, form, resolvedTemplateContent]);

  if (!profile) {
    return <div />;
  }

  const patientName = opdId
    ? [
        consultation?.patient?.firstName,
        consultation?.patient?.lastName,
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  const columns: ColumnDefWithClass<OpdCertificateType>[] = [
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <SortableHeader<OpdCertificateType> label="Date" column={column} />
      ),
      cell: ({ row }) => format(row.original.createdAt, "dd/MM/yyyy hh:mm a"),
      headerClassName: "min-w-40",
      cellClassName: "min-w-40",
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <SortableHeader<OpdCertificateType> label="Type" column={column} />
      ),
      cell: ({ row }) =>
        row.original.type === CertificateType.MEDICAL ? "Medical" : "Fitness",
      headerClassName: "min-w-28",
      cellClassName: "min-w-28",
    },
    {
      accessorKey: "patient",
      header: ({ column }) => (
        <SortableHeader<OpdCertificateType> label="Patient" column={column} />
      ),
      cell: ({ row }) =>
        [
          row.original.opd.patient.title
            ? `${row.original.opd.patient.title}.`
            : "",
          row.original.opd.patient.firstName,
          row.original.opd.patient.lastName,
        ]
          .filter(Boolean)
          .join(" "),
      headerClassName: "min-w-48",
      cellClassName: "min-w-48",
    },
    {
      accessorKey: "opd",
      header: ({ column }) => (
        <SortableHeader<OpdCertificateType> label="OPD" column={column} />
      ),
      cell: ({ row }) => row.original.opd.id,
      headerClassName: "min-w-20",
      cellClassName: "min-w-20",
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) =>
        canPrint ? (
          <CustomButton
            type="button"
            variant="secondary"
            className="h-auto px-2 py-1"
            onClick={() => window.open(`/certificate/${row.original.id}`, "_blank")}
          >
            Print
          </CustomButton>
        ) : (
          <span>-</span>
        ),
      headerClassName: "min-w-24",
      cellClassName: "min-w-24",
    },
  ];

  const onSubmit = async (values: ContentFormValues) => {
    if (opdId) {
      if (!canCreate) return;
      await createCertificate({
        opdId,
        type: activeTab,
        content: values.content,
      });
    } else {
      if (!canUpdate) return;
      await saveTemplate({
        type: activeTab,
        content: values.content,
      });
    }
  };

  const tabs = certificateTabs.map((tab) => ({
    value: tab.value,
    name: tab.name,
    content: (
      <div className="space-y-4">
        {opdId ? (
          <div className="rounded-md border border-border bg-pink-50 px-3 py-2 text-tiny">
            <div className="font-semibold">
              {patientName || "--"} | OPD #
              {String(consultation?.opdId ?? opdId)}
            </div>
            <div className="text-black/70">
              Consultant: {consultation?.consultantDoctorName || "--"} | Gender:{" "}
              {consultation?.patient?.gender || "--"}
            </div>
          </div>
        ) : null}

        {opdId && canView ? (
          <div>
            <div className="mb-2 text-sm font-semibold">Previously Created Certificates</div>
            <CustomTable
              columns={columns}
              data={certificateList?.data || []}
              page={page}
              total={certificateList?.total}
              limit={limit}
              handleChangePage={setPage}
              handleChangeLimit={setLimit}
              isLoading={listLoading}
              isError={isError}
              error={error}
              getRowId={(row) => String(row.id)}
            />
          </div>
        ) : null}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="rounded-md border border-border bg-white p-3">
              <FormField<ContentFormValues>
                type="richText"
                control={form.control}
                name="content"
                label={opdId ? "Certificate Content" : "Default Template"}
                required
              />
            </div>
            <div className="rounded-md border border-dashed border-border bg-background px-3 py-2 text-[11px] text-black/70">
              Available placeholders: {`{{patientName}}, {{uhid}}, {{gender}}, {{age}}, {{date}}, {{dateTime}}, {{opdNumber}}, {{consultantDoctor}}, {{referredBy}}`}
            </div>
            {(canCreate || canUpdate) && (
              <div className="flex justify-end gap-2">
                {opdId ? (
                  <CustomButton
                    type="button"
                    variant="outline"
                    className="bg-white text-black"
                    onClick={() => form.reset({ content: resolvedTemplateContent })}
                  >
                    Reset To Template
                  </CustomButton>
                ) : null}
                <CustomButton
                  type="submit"
                  disabled={
                    templatesLoading ||
                    consultationLoading ||
                    savingTemplate ||
                    creatingCertificate
                  }
                >
                  {opdId
                    ? creatingCertificate
                      ? "Saving..."
                      : "Save Certificate"
                    : savingTemplate
                      ? "Saving..."
                      : "Save Template"}
                </CustomButton>
              </div>
            )}
          </form>
        </Form>
      </div>
    ),
  }));

  return (
    <CustomLayout
      title={opdId ? `Certificates For OPD #${opdId}` : "Certificates"}
      buttons={
        opdId ? (
          <Link href="/certificates">
            <CustomButton variant="outline" className="bg-white text-black">
              Manage Templates
            </CustomButton>
          </Link>
        ) : undefined
      }
    >
      {!canView && !canCreate && !canUpdate && <NoPermission />}
      {(canView || canCreate || canUpdate) && (
        <CustomTabs
          tabs={tabs}
          value={activeTab}
          onValueChange={(value) => {
            const nextTab = value as CertificateType;
            setActiveTab(nextTab);
            const params = new URLSearchParams(searchParams.toString());
            params.set("tab", nextTab);
            router.replace(`/certificates?${params.toString()}`);
          }}
        />
      )}
    </CustomLayout>
  );
};

export default Certificates;
