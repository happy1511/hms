import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { MouseEventHandler } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  className?: HTMLDivElement["className"];
  children: React.ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: HTMLButtonElement["type"];
  variant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | null
    | undefined;
  disabled?: boolean;
  isLoading?: boolean;
}
const CustomButton = ({
  className,
  variant,
  children,
  type = "button",
  onClick,
  disabled = false,
  isLoading = false,
}: Props) => {
  return (
    <Button
      disabled={disabled || isLoading}
      variant={variant}
      type={type}
      className={cn(
        "py-1 px-2 cursor-pointer bg-primary text-white h-auto text-tiny!",
        className,
      )}
      onClick={onClick}
    >
      {isLoading && <Loader2 className="mr-1 size-4 animate-spin" />}
      {children}
    </Button>
  );
};

export default CustomButton;
