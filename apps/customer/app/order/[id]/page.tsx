"use client";

import { getClientFirestore, Order } from "@dartbites/firebase";
import { Badge, Button, Card, LoadingSpinner, StatusTracker } from "@dartbites/ui";
import { doc, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function OrderPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getClientFirestore();
    const ref = doc(db, "orders", params.id);

    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) {
          setError("Order not found.");
          return;
        }

        setError(null);
        setOrder({ ...(snap.data() as Order), id: snap.id });
      },
      () => {
        setError("Could not load live status. Check Firebase configuration and rules.");
      }
    );

    return () => unsub();
  }, [params.id]);

  if (error) {
    return (
      <main className="mx-auto grid min-h-screen max-w-xl place-content-center px-4">
        <Card className="border-red-200 bg-red-50 text-center text-red-700">{error}</Card>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="grid min-h-screen place-items-center">
        <LoadingSpinner />
      </main>
    );
  }

  return (
    <main className="mx-auto grid min-h-screen max-w-2xl place-content-center gap-5 px-4">
      <Card className="space-y-4 p-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Order Confirmed</p>
        <h1 className="text-4xl font-black text-orange-600">{order.orderId}</h1>
        <p className="text-sm font-semibold text-slate-700">
          {order.orderType === "dine-in" ? "Dine-in" : order.orderType === "takeaway" ? "Takeaway" : "Order type not set"}
        </p>
        <div>
          <Badge status={order.status}>{order.status}</Badge>
        </div>
        <StatusTracker status={order.status} />
        <p className="text-sm text-slate-600">Live status updates are active for this order.</p>
        <Link href="/">
          <Button className="w-full">Order another</Button>
        </Link>
      </Card>
    </main>
  );
}
