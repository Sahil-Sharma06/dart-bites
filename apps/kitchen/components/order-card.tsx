"use client";

import { Order, OrderStatus, getClientFirestore } from "@dartbites/firebase";
import { Badge, Button, Card } from "@dartbites/ui";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";

type Props = {
  order: Order;
};

function nextStatus(status: OrderStatus): OrderStatus {
  if (status === "pending") return "preparing";
  if (status === "preparing") return "ready";
  return "completed";
}

function buttonText(status: OrderStatus): string {
  if (status === "pending") return "Start Preparing";
  if (status === "preparing") return "Mark Ready";
  return "Complete";
}

export function OrderCard({ order }: Props) {
  const legacyOrder = order as Order & { orderID?: string; order_id?: string };
  const created = order.createdAt?.toDate?.() ?? new Date();
  const minsAgo = Math.max(0, Math.floor((Date.now() - created.getTime()) / 60000));
  const orderTypeLabel = order.orderType === "dine-in" ? "Dine-in" : order.orderType === "takeaway" ? "Takeaway" : "Not set";
  const orderItems = Array.isArray(order.items) ? order.items : [];
  const paymentLabel = order.paymentMethod === "cash" ? "Cash" : order.paymentMethod === "upi" ? "UPI" : "Not set";
  const displayOrderId =
    legacyOrder.orderId?.trim() ||
    legacyOrder.orderID?.trim() ||
    legacyOrder.order_id?.trim() ||
    (order.id ? `#${order.id.slice(0, 6).toUpperCase()}` : "ID pending");
  const statusTone: Record<OrderStatus, string> = {
    pending: "!bg-secondary !text-on-secondary",
    preparing: "!bg-white/10 !text-white",
    ready: "!bg-emerald-300 !text-black",
    completed: "!bg-white/10 !text-white"
  };

  const updateStatus = async () => {
    if (!order.id) return;
    const db = getClientFirestore();
    await updateDoc(doc(db, "orders", order.id), {
      status: nextStatus(order.status),
      updatedAt: serverTimestamp()
    });
  };

  return (
    <Card className="group space-y-3 !border-white/5 !bg-surface/90 !text-white shadow-none transition-all duration-300 hover:!border-secondary/40 hover:-translate-y-0.5">
      <div className="flex items-center justify-between">
        <div>
          <p className="inline-block rounded-md border border-white/10 bg-background/70 px-2 py-1 text-2xl font-black tracking-wide text-white">
            {displayOrderId}
          </p>
          <p className="text-sm text-on-surface-variant">{minsAgo} min ago</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">{orderTypeLabel}</p>
        </div>
        <Badge className={`border border-white/10 ${statusTone[order.status]}`}>{order.status}</Badge>
      </div>
      <div className="space-y-2 rounded-xl border border-white/10 bg-background/60 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">Order Details</p>
        {!orderItems.length && <p className="text-sm text-on-surface-variant">No item details available.</p>}
        <ul className="space-y-2 text-sm text-white">
          {orderItems.map((item, idx) => {
            const addons = Array.isArray(item.selectedAddons) ? item.selectedAddons : [];
            const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 0);

            return (
              <li key={`${item.menuItemId}-${idx}`} className="rounded-lg border border-white/5 bg-surface/60 p-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">
                    {item.quantity} x {item.name}
                  </p>
                  <p className="text-xs font-semibold text-on-surface-variant">Rs {lineTotal.toFixed(2)}</p>
                </div>
                {addons.length > 0 && (
                  <p className="mt-1 text-xs text-on-surface-variant">Addons: {addons.join(", ")}</p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex items-center justify-between text-xs text-on-surface-variant">
        <span>Payment: {paymentLabel}</span>
        <span className="font-semibold text-white">Total: Rs {(Number(order.totalAmount) || 0).toFixed(2)}</span>
      </div>
      <Button
        className="w-full !bg-secondary !text-on-secondary hover:brightness-110"
        disabled={!order.id}
        onClick={updateStatus}
      >
        {buttonText(order.status)}
      </Button>
    </Card>
  );
}

