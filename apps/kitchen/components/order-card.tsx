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

  const updateStatus = async () => {
    if (!order.id) return;
    const db = getClientFirestore();
    await updateDoc(doc(db, "orders", order.id), {
      status: nextStatus(order.status),
      updatedAt: serverTimestamp()
    });
  };

  return (
    <Card className="space-y-3 !border-slate-700 !bg-slate-900 !text-slate-100 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="inline-block rounded-md bg-slate-800 px-2 py-1 text-2xl font-black tracking-wide text-white">
            {displayOrderId}
          </p>
          <p className="text-sm text-slate-400">{minsAgo} min ago</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">{orderTypeLabel}</p>
        </div>
        <Badge status={order.status}>{order.status}</Badge>
      </div>
      <div className="space-y-2 rounded-xl border border-slate-700 bg-slate-800/60 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Order Details</p>
        {!orderItems.length && <p className="text-sm text-slate-300">No item details available.</p>}
        <ul className="space-y-2 text-sm text-slate-100">
          {orderItems.map((item, idx) => {
            const addons = Array.isArray(item.selectedAddons) ? item.selectedAddons : [];
            const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 0);

            return (
              <li key={`${item.menuItemId}-${idx}`} className="rounded-lg bg-slate-900/70 p-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">
                    {item.quantity} x {item.name}
                  </p>
                  <p className="text-xs font-semibold text-slate-300">Rs {lineTotal.toFixed(2)}</p>
                </div>
                {addons.length > 0 && (
                  <p className="mt-1 text-xs text-slate-300">Addons: {addons.join(", ")}</p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-300">
        <span>Payment: {paymentLabel}</span>
        <span className="font-semibold text-slate-100">Total: Rs {(Number(order.totalAmount) || 0).toFixed(2)}</span>
      </div>
      <Button
        className="w-full !bg-emerald-500 !text-slate-900 hover:!bg-emerald-400"
        disabled={!order.id}
        onClick={updateStatus}
      >
        {buttonText(order.status)}
      </Button>
    </Card>
  );
}

