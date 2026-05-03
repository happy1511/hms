"use client";

import CustomButton from "@/components/common/CustomButton";
import { cn } from "@/lib/utils";
import {
  CircleAlert,
  LoaderIcon,
  LockKeyhole,
  RefreshCcw,
  SearchX,
} from "lucide-react";

type PageStateVariant = "loading" | "error" | "permission" | "empty";

const variantConfig: Record<
  PageStateVariant,
  {
    icon: typeof LoaderIcon;
    iconClassName: string;
    title: string;
    description: string;
  }
> = {
  loading: {
    icon: LoaderIcon,
    iconClassName: "text-primary animate-spin",
    title: "Loading",
    description: "Please wait while we load this page.",
  },
  error: {
    icon: CircleAlert,
    iconClassName: "text-destructive",
    title: "Something went wrong",
    description: "We could not load this page right now.",
  },
  permission: {
    icon: LockKeyhole,
    iconClassName: "text-destructive",
    title: "Permission denied",
    description: "You do not have permission to access this page.",
  },
  empty: {
    icon: SearchX,
    iconClassName: "text-muted-foreground",
    title: "No data found",
    description: "There is nothing to show here yet.",
  },
};

type Props = {
  variant: PageStateVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

const PageState = ({
  variant,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: Props) => {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex min-h-60 w-full items-center justify-center rounded-lg border bg-white p-6",
        className,
      )}
    >
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        <div className="rounded-full bg-muted p-3">
          <Icon className={cn("size-6", config.iconClassName)} />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">
            {title || config.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {description || config.description}
          </p>
        </div>
        {actionLabel && onAction ? (
          <CustomButton type="button" variant="outline" onClick={onAction}>
            <RefreshCcw className="size-4" />
            {actionLabel}
          </CustomButton>
        ) : null}
      </div>
    </div>
  );
};

export default PageState;
