"use client";

import CustomButton from "@/components/common/CustomButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PathologyOrderType } from "@/lib/type";
import { useMemo, useState } from "react";
import PathologyMultiPrintOrderList from "./PathologyMultiPrintOrderList";

const moveItem = (ids: number[], orderId: number, direction: "up" | "down") => {
  const currentIndex = ids.findIndex((id) => id === orderId);
  if (currentIndex === -1) return ids;

  const targetIndex =
    direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= ids.length) return ids;

  const nextIds = [...ids];
  [nextIds[currentIndex], nextIds[targetIndex]] = [
    nextIds[targetIndex],
    nextIds[currentIndex],
  ];
  return nextIds;
};

const PathologyMultiPrintDialog = ({
  open,
  onOpenChange,
  orders,
  patientName,
  onPrint,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orders: PathologyOrderType[];
  patientName: string;
  onPrint: (orderIds: number[]) => void;
}) => {
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>(
    orders.map((order) => order.id),
  );
  const [orderedOrderIds, setOrderedOrderIds] = useState<number[]>(
    orders.map((order) => order.id),
  );

  const selectedCount = selectedOrderIds.length;
  const allSelected = selectedCount > 0 && selectedCount === orders.length;

  const printOrderIds = useMemo(
    () => orderedOrderIds.filter((orderId) => selectedOrderIds.includes(orderId)),
    [orderedOrderIds, selectedOrderIds],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl border-secondary border-4 bg-white">
        <DialogHeader>
          <DialogTitle>Print Multiple Pathology Reports</DialogTitle>
          <DialogDescription>
            Choose the completed orders to print for {patientName || "this patient"}
            {" "}and arrange them in the order you want.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between text-xs">
          <div className="text-muted-foreground">
            {selectedCount} of {orders.length} orders selected
          </div>
          <div className="flex items-center gap-2">
            <CustomButton
              variant="outline"
              className="bg-white text-black"
              onClick={() =>
                setSelectedOrderIds(allSelected ? [] : orders.map((order) => order.id))
              }
            >
              {allSelected ? "Clear All" : "Select All"}
            </CustomButton>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-auto pr-1">
          <PathologyMultiPrintOrderList
            orders={orders}
            selectedOrderIds={selectedOrderIds}
            orderedOrderIds={orderedOrderIds}
            onToggle={(orderId, checked) => {
              setSelectedOrderIds((current) => {
                if (checked) {
                  return current.includes(orderId) ? current : [...current, orderId];
                }
                return current.filter((id) => id !== orderId);
              });
            }}
            onMove={(orderId, direction) => {
              setOrderedOrderIds((current) => moveItem(current, orderId, direction));
            }}
          />
        </div>

        <DialogFooter>
          <CustomButton
            variant="outline"
            className="bg-white text-black"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </CustomButton>
          <CustomButton
            disabled={printOrderIds.length === 0}
            onClick={() => onPrint(printOrderIds)}
          >
            Print
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PathologyMultiPrintDialog;
