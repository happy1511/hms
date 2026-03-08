"use client";

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
import { useState } from "react";
import { Button } from "../ui/button";

interface Props {
  title: string;
  description: React.ReactNode;
  cancelText: string;
  confirmText: string;
  triggerButton: React.ReactNode;
  handleConfirm: () => void | Promise<unknown>;
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
  const [internalOpen, setInternalOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const isOpen = open ?? internalOpen;
  const isPending = pending || isConfirming;

  const handleOpenChange = (nextOpen: boolean) => {
    if (open === undefined) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);
  };

  const onConfirm = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (isPending) {
      return;
    }

    try {
      setIsConfirming(true);
      await Promise.resolve(handleConfirm());
      handleOpenChange(false);
    } finally {
      setIsConfirming(false);
    }
  };

  const iconClassName =
    iconType === "confirm"
      ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
      : "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive";

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
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
          <AlertDialogCancel disabled={isPending} variant="outline">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={onConfirm}
            variant={confirmVariant}
          >
            {isPending ? <RotateCcw className="animate-spin" /> : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
