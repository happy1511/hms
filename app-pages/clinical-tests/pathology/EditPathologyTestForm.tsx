"use client";

import CustomLayout from "@/components/common/CustomLayout";
import { useGetPathologyTest } from "@/hooks/query/pathology";
import { PathologyTestDataType } from "@/lib/type";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";
import PathologyTestInfoForm from "./components/PathologyTestInfoForm";
import PathologyTestParameterTable from "./components/PathologyTestParameterTable";

const EditPathologyTestForm = () => {
  const { testId }: { testId?: string } = useParams();

  const { data, isLoading: fetchingTest } = useGetPathologyTest(testId);

  if (fetchingTest) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoaderIcon
          role="status"
          aria-label="Loading"
          className="size-4 animate-spin"
        />
      </div>
    );
  }

  if (testId && !data) {
    return <div />;
  }

  return (
    <div className="space-y-2">
      <CustomLayout title="Test Information">
        <PathologyTestInfoForm data={data as PathologyTestDataType} />
      </CustomLayout>

      <CustomLayout title="Test Parameters">
        <PathologyTestParameterTable data={data as PathologyTestDataType} />
      </CustomLayout>
    </div>
  );
};

export default EditPathologyTestForm;
