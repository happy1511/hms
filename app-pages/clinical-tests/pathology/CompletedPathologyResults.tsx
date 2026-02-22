"use client";

import CustomLayout from "@/components/common/CustomLayout";
import { PathologyTestOrderWithResults } from "@/lib/type";
import { useCompletedPathologyOrdersWithResults } from "@/hooks/query/pathology";
import { useState } from "react";
import { LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const isOutOfRange = (
  value: number | null | undefined,
  ranges: Array<{ lowerRange?: number | null; upperRange?: number | null }>,
): boolean => {
  if (value === null || value === undefined || !ranges.length) return false;

  const range = ranges[0];
  if (range.lowerRange !== null && range.lowerRange !== undefined) {
    if (value < range.lowerRange) return true;
  }
  if (range.upperRange !== null && range.upperRange !== undefined) {
    if (value > range.upperRange) return true;
  }
  return false;
};

interface CompletedPathologyResultsProps {
  opdId: number;
}

const CompletedPathologyResults = ({
  opdId,
}: CompletedPathologyResultsProps) => {
  const {
    data: orders,
    isLoading,
    isError,
  } = useCompletedPathologyOrdersWithResults(opdId);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const selectedOrder = orders?.find(
    (o: PathologyTestOrderWithResults) => o.id === selectedOrderId,
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
        No completed pathology orders found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[30%_70%] gap-4">
      {/* Left Column - Tests List */}
      <CustomLayout
        title="Completed Pathology Tests"
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
      <CustomLayout title="Test Results Report">
        {selectedOrder ? (
          <div className="space-y-4">
            {/* Report Header */}
            <div className="border-b-2">
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                {selectedOrder.test.name}
              </h3>
            </div>

            {/* Results Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-tiny">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="px-4 py-2 text-left font-semibold text-gray-700">
                      Parameter
                    </th>
                    <th className="px-4 py-2 text-center font-semibold text-gray-700">
                      Result
                    </th>
                    <th className="px-4 py-2 text-center font-semibold text-gray-700">
                      Ref. Range
                    </th>
                    <th className="px-4 py-2 text-center font-semibold text-gray-700">
                      Unit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.results.map((result: any, idx: number) => {
                    const isNumeric =
                      result.numericValue !== null &&
                      result.numericValue !== undefined;
                    const isText =
                      result.textValue !== null &&
                      result.textValue !== undefined;
                    const isOutOfRangeValue =
                      isNumeric &&
                      isOutOfRange(
                        result.numericValue,
                        result.applicableReferenceRanges,
                      );

                    const refRange = result.applicableReferenceRanges[0];
                    const rangeText =
                      refRange &&
                      (refRange.lowerRange !== null ||
                        refRange.upperRange !== null)
                        ? `${refRange.lowerRange ?? "-"} - ${refRange.upperRange ?? "-"}`
                        : "N/A";

                    let displayValue = "-";
                    if (isNumeric) {
                      displayValue = result.numericValue?.toString() ?? "-";
                    } else if (isText) {
                      displayValue = result.textValue;
                    } else if (result.parameter.isDescriptiveOnly) {
                      displayValue = result.remark || "-";
                    }

                    return (
                      <tr
                        key={result.id}
                        className={`border-b ${
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-gray-100`}
                      >
                        <td className="px-4 py-2 text-gray-700 font-medium">
                          {result.parameter.name}
                        </td>
                        <td
                          className={`px-4 py-2 text-center font-semibold ${
                            isOutOfRangeValue ? "text-red-600" : "text-gray-800"
                          }`}
                        >
                          {displayValue}
                        </td>
                        <td className="px-4 py-2 text-center text-gray-600">
                          {rangeText}
                        </td>
                        <td className="px-4 py-2 text-center text-gray-600">
                          {refRange?.unit || "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Remarks Section */}
            {selectedOrder.results.some((r: any) => r.remark) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Remarks:</h4>
                <ul className="space-y-1 text-tiny text-blue-800">
                  {selectedOrder.results
                    .filter((r: any) => r.remark)
                    .map((r: any) => (
                      <li key={r.id}>
                        <span className="font-medium">{r.parameter.name}:</span>{" "}
                        {r.remark}
                      </li>
                    ))}
                </ul>
              </div>
            )}
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

export default CompletedPathologyResults;
