import { OPDType } from "@/lib/type";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { PlusIcon } from "lucide-react";
import InvoiceExport from "../common/InvoiceExport";

interface Props {
  opd: OPDType;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

const ViewInvoiceModal = ({ open, onOpenChange, opd, trigger }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="outline"
            className="h-auto shadow-none p-1 cursor-pointer"
          >
            <PlusIcon className="size-2.5 text-destructive" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-xl! border-secondary border-4 bg-white h-[90dvh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-black/60 text-sm">
            Add Payment Transaction
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-tiny flex-1">
          <InvoiceExport
            discount={10}
            paid={10}
            billingItems={[
              {
                name: "Electronics",
                items: [
                  {
                    description: "Wireless Mouse",
                    qty: 2,
                    price: 25,
                    discount: 5,
                  },
                  { description: "Keyboard", qty: 1, price: 55, discount: 0 },
                ],
              },
              {
                name: "Software",
                items: [
                  {
                    description: "Antivirus License",
                    qty: 3,
                    price: 40,
                    discount: 10,
                  },
                  {
                    description: "Windows License",
                    qty: 1,
                    price: 120,
                    discount: 20,
                  },
                ],
              },
            ]}
            customer={{
              name: "John Smith",
              address: "742 Evergreen Terrace",
              phone: "+1 999 888 777",
              email: "john@email.com",
            }}
            invoice={{
              number: "INV-2025-0012",
              date: "2025-02-10",
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewInvoiceModal;
