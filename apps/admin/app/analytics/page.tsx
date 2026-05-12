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
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-sm text-slate-500">Today&apos;s Order Count</p>
            <p className="text-3xl font-black">{orderCount}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Today&apos;s Revenue</p>
            <p className="text-3xl font-black">Rs {revenue.toFixed(2)}</p>
          </Card>
          <Card>
            <p className="text-sm text-slate-500">Top 5 Items</p>
            <ul className="mt-2 space-y-1 text-sm">
              {topItems.map((item) => (
                <li key={item.name}>
                  {item.name}: {item.qty}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card className="mt-4 h-[360px]">
          <p className="mb-3 text-sm font-semibold text-slate-600">Hourly Order Volume</p>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourly}>
              <XAxis dataKey="hour" hide />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="orders" fill="#334155" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </AdminShell>
    </AuthGuard>
  );
}

