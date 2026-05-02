"use client";

import CustomFilters from "@/components/common/CustomFilters";
import CustomLayout from "@/components/common/CustomLayout";
import NoPermission from "@/components/common/NoPermission";
import PatientDocumentsTable from "@/components/patient/PatientDocumentsTable";
import { ActionType, DocumentType, ModuleType } from "@/generated/prisma/enums";
import { useProfile } from "@/hooks/query/auth";
import { usePatientDocumentsList } from "@/hooks/query/patient";
import { FilterConfig, FilterValues } from "@/lib/type";
import { hasActionPermission } from "@/lib/utils";
import { useState } from "react";

const neededFilters: FilterConfig<FilterValues>[] = [
  {
    label: "Patient Name / File",
    valueKey: "name",
    type: "text",
    placeholder: "Search by patient or file",
  },
  {
    label: "UHID",
    valueKey: "uhid",
    type: "text",
    placeholder: "Enter UHID",
  },
  {
    label: "Contact No",
    valueKey: "contactNo",
    type: "text",
    placeholder: "Enter contact number",
  },
  {
    label: "Document Name",
    valueKey: "documentType",
    type: "select",
    placeholder: "Select document name",
    options: Object.values(DocumentType).map((type) => ({
      label: type,
      value: type,
    })),
  },
  { label: "Created Date", valueKey: "createdAt", type: "dateRange" },
];

const PatientDocuments = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState<FilterValues>({});

  const { data: profile } = useProfile(false);
  const { data, isLoading, isFetching, refetch, isError, error } =
    usePatientDocumentsList(filters, page, limit);

  if (!profile) {
    return <div />;
  }

  const canView =
    hasActionPermission(profile.data, ModuleType.PATIENT_MASTER, ActionType.VIEW) ||
    hasActionPermission(profile.data, ModuleType.OPD_BILL, ActionType.VIEW) ||
    hasActionPermission(profile.data, ModuleType.IPD_BILL, ActionType.VIEW) ||
    hasActionPermission(profile.data, ModuleType.DAY_CARE_IPD, ActionType.VIEW) ||
    hasActionPermission(
      profile.data,
      ModuleType.DISCHARGE_PATIENT,
      ActionType.VIEW,
    );

  return (
    <CustomLayout title="Patient Documents">
      {!canView && <NoPermission />}
      {canView && (
        <>
          <CustomFilters<FilterValues>
            filters={neededFilters}
            defaultValues={filters}
            onSubmit={(values) => {
              setPage(1);
              setFilters(values);
            }}
            onRefresh={refetch}
            isLoading={isLoading || isFetching}
            isRefreshing={isFetching}
            filtersContainerClassName="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          />
          <PatientDocumentsTable
            data={data?.data || []}
            page={page}
            total={data?.total}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={setLimit}
            isLoading={isLoading}
            isError={isError}
            error={error}
          />
        </>
      )}
    </CustomLayout>
  );
};

export default PatientDocuments;
