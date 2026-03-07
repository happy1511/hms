import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CircleHelp, RotateCcw, Trash2Icon } from "lucide-react";
import { Button } from "../ui/button";

interface Props {
  title: string;
  description: React.ReactNode;
  cancelText: string;
  confirmText: string;
  triggerButton: React.ReactNode;
  handleConfirm: () => void;
  pending?: boolean;
  iconType?: "delete" | "confirm";
  confirmVariant?: React.ComponentProps<typeof Button>["variant"];

  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CustomAlert({
  title,
  description,
  confirmText,
  cancelText,
  handleConfirm,
  triggerButton,
  pending,
  iconType = "delete",
  confirmVariant = "destructive",
  open,
  onOpenChange,
}: Props) {
  const iconClassName =
    iconType === "confirm"
      ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
      : "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>{triggerButton}</AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className={iconClassName}>
            {iconType === "confirm" ? <CircleHelp /> : <Trash2Icon />}
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={handleConfirm}
            variant={confirmVariant}
          >
            {pending ? <RotateCcw /> : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
