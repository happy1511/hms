"use client";

import { LoaderIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommonLoaderProps {
  label?: string;
  className?: string;
  fullScreen?: boolean;
}

const CommonLoader = ({
  label = "Loading...",
  className,
  fullScreen = false,
}: CommonLoaderProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-linear-to-b from-background via-background to-muted/40",
        fullScreen ? "min-h-dvh w-full" : "min-h-[160px] w-full rounded-lg",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-12 items-center justify-center rounded-full border border-border bg-background shadow-sm">
          <LoaderIcon className="size-5 animate-spin text-secondary" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">
            Please wait while we fetch the latest data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommonLoader;
