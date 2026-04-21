"use client";

import CustomButton from "@/components/common/CustomButton";
import { Checkbox } from "@/components/ui/checkbox";
import { PathologyOrderType } from "@/lib/type";
import { format } from "date-fns";
import { ArrowDown, ArrowUp } from "lucide-react";

const PathologyMultiPrintOrderList = ({
  orders,
  selectedOrderIds,
  orderedOrderIds,
  onToggle,
  onMove,
}: {
  orders: PathologyOrderType[];
  selectedOrderIds: number[];
  orderedOrderIds: number[];
  onToggle: (orderId: number, checked: boolean) => void;
  onMove: (orderId: number, direction: "up" | "down") => void;
}) => {
  const orderedOrders = orderedOrderIds
    .map((orderId) => orders.find((order) => order.id === orderId) || null)
    .filter((order): order is PathologyOrderType => Boolean(order));

  return (
    <div className="space-y-2">
      {orderedOrders.map((order, index) => {
        const isChecked = selectedOrderIds.includes(order.id);

        return (
          <div
            key={order.id}
            className="flex items-center gap-3 rounded-md border border-black/10 bg-white p-3"
          >
            <Checkbox
              checked={isChecked}
              onCheckedChange={(checked) => onToggle(order.id, Boolean(checked))}
            />
            <div className="min-w-0 flex-1 text-xs">
              <div className="font-semibold text-sm">{order.test.name}</div>
              <div className="text-muted-foreground">
                Order #{order.id} • {order.status}
              </div>
              <div className="text-muted-foreground">
                Created: {format(new Date(order.createdAt), "MMM dd, yyyy")}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <CustomButton
                variant="outline"
                className="bg-white text-black"
                disabled={index === 0}
                onClick={() => onMove(order.id, "up")}
              >
                <ArrowUp className="size-4" />
              </CustomButton>
              <CustomButton
                variant="outline"
                className="bg-white text-black"
                disabled={index === orderedOrders.length - 1}
                onClick={() => onMove(order.id, "down")}
              >
                <ArrowDown className="size-4" />
              </CustomButton>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PathologyMultiPrintOrderList;
