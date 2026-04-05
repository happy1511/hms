"use client";

import CustomFilters from "@/components/common/CustomFilters";
import { useInfiniteDoctorList } from "@/hooks/query/doctor";
import {
  Doctor,
  FilterConfig,
  FilterValues,
  PaginatedResponse,
} from "@/lib/type";
import { useState } from "react";

interface PatientCareFiltersProps {
  defaultValues?: FilterValues;
  onSubmit: (values: FilterValues) => void;
  onRefresh?: () => Promise<unknown> | unknown;
  isRefreshing?: boolean;
}

const PatientCareFilters = ({
  defaultValues,
  onSubmit,
  onRefresh,
  isRefreshing,
}: PatientCareFiltersProps) => {
  const [consultantValue, setConsultantValue] = useState("");

  const consultantQuery = useInfiniteDoctorList(
    {
      doctorType: "consulting",
      name: consultantValue,
    },
    10,
  );

  const filters: FilterConfig<FilterValues>[] = [
    { label: "Created Date", valueKey: "createdAt", type: "dateRange" },
    {
      label: "Filter by Consultant",
      valueKey: "consultantDoctor",
      type: "infiniteSelect",
      placeholder: "Search by name here.",
      query: consultantQuery,
      getItems: (data) => (data as PaginatedResponse<Doctor>)?.data,
      valueKeyExtractor: (item) => String((item as Doctor).userId),
      labelKey: (item) => (item as Doctor).user.name,
      search: consultantValue,
      onSearchChange: setConsultantValue,
    },
  ];

  return (
    <CustomFilters<FilterValues>
      filters={filters}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      onRefresh={onRefresh}
      isRefreshing={isRefreshing}
      filtersContainerClassName="grid-cols-1 md:grid-cols-2"
    />
  );
};

export default PatientCareFilters;
