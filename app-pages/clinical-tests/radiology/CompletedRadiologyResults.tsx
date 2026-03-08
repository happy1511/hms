"use client";

import CustomLayout from "@/components/common/CustomLayout";
import { RadiologyTestOrderWithResults } from "@/lib/type";
import { useCompletedRadiologyOrdersWithResults } from "@/hooks/query/radiology";
import { useState } from "react";
import { LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompletedRadiologyResultsProps {
  opdId: number;
}

const CompletedRadiologyResults = ({
  opdId,
}: CompletedRadiologyResultsProps) => {
  const {
    data: orders,
    isLoading,
    isError,
  } = useCompletedRadiologyOrdersWithResults(opdId);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const selectedOrder = orders?.find(
    (o: RadiologyTestOrderWithResults) => o.id === selectedOrderId,
  );

  if (isLoading) {
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

  if (isError) {
    return (
      <div className="text-center py-4 text-red-600">Error loading results</div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-4">
        No completed radiology orders found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[30%_70%] gap-4">
      {/* Left Column - Tests List */}
      <CustomLayout
        title="Completed Radiology Tests"
        contentClassName="grid grid-cols-1"
      >
        {orders.map((item, _) => {
          return (
            <button
              onClick={() => setSelectedOrderId(item.id)}
              key={_}
              className={cn(
                "w-full text-start px-2 py-1",
                selectedOrderId === item.id
                  ? "bg-primary text-white text-tiny!"
                  : "bg-background text-foreground text-tiny!",
              )}
            >
              {item.test.name}
            </button>
          );
        })}
      </CustomLayout>

      {/* Right Column - Test Results Report */}
      <CustomLayout title="Radiology Report">
        {selectedOrder ? (
          <div className="space-y-4">
            {/* Report Header */}
            <div className="border-b-2">
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                {selectedOrder.test.name}
              </h3>
            </div>

            {/* Results Report */}
            <div className="border rounded-lg overflow-hidden bg-white">
              {selectedOrder.test.template && (
                <div className="p-4 border-b bg-gray-50">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    {selectedOrder.test.template.name}
                  </h4>
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        selectedOrder.results?.[0].value ||
                        selectedOrder.test.template.content,
                    }}
                    className="text-sm text-gray-600 whitespace-pre-wrap font-mono"
                  ></div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Select a test to view results
          </div>
        )}
      </CustomLayout>
    </div>
  );
};

export default CompletedRadiologyResults;
