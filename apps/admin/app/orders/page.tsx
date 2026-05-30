"use client";

import { Order, OrderStatus, getClientFirestore } from "@dartbites/firebase";
import { Badge, Card } from "@dartbites/ui";
import { collection, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where, doc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "../../components/admin-shell";
import { AuthGuard } from "../../components/auth-guard";

const statuses: Array<"all" | OrderStatus> = ["all", "pending", "preparing", "ready", "completed"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<(typeof statuses)[number]>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const statusTone: Record<OrderStatus, string> = {
    pending: "!bg-secondary !text-on-secondary",
    preparing: "!bg-white/10 !text-white",
    ready: "!bg-emerald-300 !text-black",
    completed: "!bg-white/10 !text-white"
  };

  useEffect(() => {
    const db = getClientFirestore();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(collection(db, "orders"), where("createdAt", ">=", today), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ ...(d.data() as Order), id: d.id })));
    });

    return () => unsub();
  }, []);

  const filtered = useMemo(
    () => (statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter)),
    [orders, statusFilter]
  );

  const setStatus = async (id: string, status: OrderStatus) => {
    const db = getClientFirestore();
    await updateDoc(doc(db, "orders", id), { status, updatedAt: serverTimestamp() });
  };

  return (
    <AuthGuard>
      <AdminShell>
        <Card className="space-y-4 !border-white/10 !bg-surface/90 !text-white">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h1 className="font-sora text-2xl font-extrabold uppercase tracking-tight">Today&apos;s Orders</h1>
            <select
              className="border border-white/10 bg-background/60 px-3 py-2 text-xs uppercase tracking-widest text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as (typeof statuses)[number])}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="text-xs uppercase tracking-widest text-on-surface-variant">
                <tr>
                  <th className="py-2">Order ID</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <>
                    <tr
                      key={order.id}
                      className="cursor-pointer border-t border-white/10"
                      onClick={() => setExpanded(expanded === order.id ? null : (order.id as string))}
                    >
                      <td className="py-3 font-bold">{order.orderId}</td>
                      <td className="text-on-surface-variant">{order.items.slice(0, 2).map((i) => i.name).join(", ")}</td>
                      <td>Rs {order.totalAmount.toFixed(2)}</td>
                      <td>
                        <span className="border border-white/10 px-2 py-1 text-xs font-semibold text-on-surface-variant">
                          {order.orderType === "dine-in" ? "Dine-in" : order.orderType === "takeaway" ? "Takeaway" : "Not set"}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Badge status={order.status} className={`border border-white/10 ${statusTone[order.status]}`}>
                            {order.status}
                          </Badge>
                          <select
                            className="border border-white/10 bg-background/60 px-2 py-1 text-xs uppercase tracking-widest text-white"
                            value={order.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setStatus(order.id as string, e.target.value as OrderStatus)}
                          >
                            <option value="pending">pending</option>
                            <option value="preparing">preparing</option>
                            <option value="ready">ready</option>
                            <option value="completed">completed</option>
                          </select>
                        </div>
                      </td>
                      <td>{order.createdAt?.toDate?.().toLocaleTimeString() ?? "-"}</td>
                    </tr>
                    {expanded === order.id && (
                      <tr className="border-t border-white/10 bg-background/60">
                        <td colSpan={6} className="px-3 py-3 text-on-surface-variant">
                          <ul className="space-y-1">
                            {order.items.map((item, idx) => (
                              <li key={`${item.menuItemId}-${idx}`}>
                                {item.quantity} x {item.name}
                                {item.selectedAddons.length ? ` (${item.selectedAddons.join(", ")})` : ""}
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </AdminShell>
    </AuthGuard>
  );
}

