"use client";

import CustomLayout from "@/components/common/CustomLayout";
import { useGetConsultationFile } from "@/hooks/query/opd";
import { format } from "date-fns";
import { LoaderIcon } from "lucide-react";
import { useParams } from "next/navigation";

const getTimeAgoLabel = (value?: string | Date) => {
  if (!value) return "--";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  const totalMinutes = Math.floor(
    Math.abs(Date.now() - date.getTime()) / (1000 * 60),
  );
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!hours && !minutes) return "just now";
  if (!hours) return `${minutes} minute(s) ago`;
  if (!minutes) return `${hours} hour(s) ago`;

  return `${hours} hour(s), ${minutes} minute(s) ago`;
};

const OpdConsultationHistory = () => {
  const { opdId }: { opdId?: string } = useParams();
  const { data, isLoading } = useGetConsultationFile(opdId);
  const history = data?.previousOpdHistory ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full py-4">
        <LoaderIcon role="status" aria-label="Loading" className="size-4 animate-spin" />
      </div>
    );
  }

  return (
    <CustomLayout title="Previous OPD Files">
      {!history.length ? (
        <p className="text-sm text-muted-foreground">No previous OPD history found.</p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {history.map((item) => (
            <div
              key={item.opdId}
              className="rounded-md border border-border bg-muted/20 p-3"
            >
              <p className="font-medium">OPD File #{item.opdId}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(item.createdAt), "dd/MM/yyyy")}
              </p>
              <p className="text-xs text-muted-foreground">
                {getTimeAgoLabel(item.createdAt)}
              </p>
              <div className="mt-2">
                <p className="text-sm font-medium">Investigations:</p>
                {item.investigations?.length ? (
                  <p className="text-sm">{item.investigations.join(", ")}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">--</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </CustomLayout>
  );
};

export default OpdConsultationHistory;

