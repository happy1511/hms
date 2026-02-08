import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

const CustomLayout = ({
  children,
  title,
  buttons,
  titleClassName,
  contentClassName,
}: {
  children: React.ReactNode;
  title: string;
  buttons?: React.ReactNode;
  titleClassName?: HTMLAttributes<HTMLDivElement>["className"];
  contentClassName?: HTMLAttributes<HTMLDivElement>["className"];
}) => {
  return (
    <div className="border border-pink-200 shadow-md">
      <div
        className={cn(
          "bg-accent border-b border-pink-200 text-black text-sm p-1 flex w-full justify-between items-center",
          titleClassName,
        )}
      >
        <div>{title}</div>
        {!!buttons && buttons}
      </div>
      <div className={cn("p-3 bg-white", contentClassName)}>{children}</div>
    </div>
  );
};

export default CustomLayout;
