import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { MouseEventHandler } from "react";

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
}
const CustomButton = ({
  className,
  variant,
  children,
  type = "button",
  onClick,
  disabled = false,
}: Props) => {
  return (
    <Button
      disabled={disabled}
      variant={variant}
      type={type}
      className={cn(
        "py-1 px-2 cursor-pointer bg-primary text-white h-auto text-tiny!",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

export default CustomButton;
