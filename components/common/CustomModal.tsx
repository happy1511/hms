import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import React from "react";

interface Props {
  open?: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  content: React.ReactNode;
  footer: React.ReactNode;
  form?: boolean;
}
export function CustomDialog({
  open,
  onOpenChange,
  title,
  description,
  content,
  footer,
  form = false,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle className={cn(title ? "" : "sr-only")}>
              {title}
            </DialogTitle>
            <DialogDescription className={cn(description ? "" : "sr-only")}>
              {description}
            </DialogDescription>
          </DialogHeader>
          {content}
          {form ? (
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          ) : (
            <DialogFooter>{footer}</DialogFooter>
          )}
        </DialogContent>
      </form>
    </Dialog>
  );
}
