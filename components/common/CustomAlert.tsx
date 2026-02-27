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
import { RotateCcw, Trash2Icon } from "lucide-react";

interface Props {
  title: string;
  description: React.ReactNode;
  cancelText: string;
  confirmText: string;
  triggerButton: React.ReactNode;
  handleConfirm: () => void;
  pending?: boolean;

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
  open,
  onOpenChange,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>{triggerButton}</AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={handleConfirm}
            variant="destructive"
          >
            {pending ? <RotateCcw /> : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
