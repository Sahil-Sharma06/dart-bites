"use client";

import { Order, getClientFirestore } from "@dartbites/firebase";
import { Card } from "@dartbites/ui";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AdminShell } from "../../components/admin-shell";
import { AuthGuard } from "../../components/auth-guard";

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const db = getClientFirestore();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const q = query(collection(db, "orders"), where("createdAt", ">=", today), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ ...(d.data() as Order), id: d.id })));
    });

    return () => unsub();
  }, []);

  const orderCount = orders.length;
  const revenue = useMemo(() => orders.reduce((acc, order) => acc + order.totalAmount, 0), [orders]);

  const topItems = useMemo(() => {
    const counts = new Map<string, number>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        counts.set(item.name, (counts.get(item.name) ?? 0) + item.quantity);
      });
    });

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, qty]) => ({ name, qty }));
  }, [orders]);

  const hourly = useMemo(() => {
    const hours = Array.from({ length: 24 }).map((_, h) => ({ hour: `${h}:00`, orders: 0 }));
    orders.forEach((order) => {
      const dt = order.createdAt?.toDate?.();
      if (!dt) return;
      hours[dt.getHours()].orders += 1;
    });
    return hours;
  }, [orders]);

  return (
    <AuthGuard>
      <AdminShell>
        <div className="grid items-stretch gap-4 md:grid-cols-3">
          <Card className="flex min-h-[120px] flex-col justify-between !border-white/10 !bg-surface/90 !text-white">
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Today&apos;s Order Count</p>
            <p className="font-sora text-3xl font-extrabold">{orderCount}</p>
          </Card>
          <Card className="flex min-h-[120px] flex-col justify-between !border-white/10 !bg-surface/90 !text-white">
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Today&apos;s Revenue</p>
            <p className="font-sora text-3xl font-extrabold">Rs {revenue.toFixed(2)}</p>
          </Card>
          <Card className="flex min-h-[120px] flex-col !border-white/10 !bg-surface/90 !text-white">
            <p className="text-xs uppercase tracking-widest text-on-surface-variant">Top 5 Items</p>
            <ul className="mt-3 space-y-1 text-sm text-on-surface-variant">
              {topItems.map((item) => (
                <li key={item.name} className="flex items-center justify-between">
                  <span>{item.name}</span>
                  <span className="text-white">{item.qty}</span>
                </li>
              ))}
              {topItems.length === 0 && <li className="text-on-surface-variant">No orders yet</li>}
            </ul>
          </Card>
        </div>

        <Card className="mt-6 flex h-[380px] flex-col !border-white/10 !bg-surface/90 !text-white">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Hourly Order Volume</p>
            <span className="text-xs uppercase tracking-widest text-on-surface-variant">Today</span>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourly}>
                <XAxis dataKey="hour" hide />
                <YAxis allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#0B1326", border: "1px solid rgba(255,255,255,0.1)", color: "#FFFFFF" }}
                  itemStyle={{ color: "#FFFFFF" }}
                  labelStyle={{ color: "#94A3B8" }}
                />
                <Bar dataKey="orders" fill="#FFE600" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </AdminShell>
    </AuthGuard>
  );
}

