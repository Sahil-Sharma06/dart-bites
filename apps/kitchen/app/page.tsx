"use client";

import { Order, getClientFirestore } from "@dartbites/firebase";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { OrderCard } from "../components/order-card";

function playBeep() {
  const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;

  const ctx = new Ctx();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = 880;
  gain.gain.value = 0.15;
  oscillator.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.15);
}

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const previousOrderCount = useRef(0);

  useEffect(() => {
    const db = getClientFirestore();
    const q = query(collection(db, "orders"), orderBy("createdAt", "asc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const nextOrders = snap.docs.map((docSnap) => ({ ...(docSnap.data() as Order), id: docSnap.id }));

        if (previousOrderCount.current > 0 && nextOrders.length > previousOrderCount.current) {
          playBeep();
        }

        previousOrderCount.current = nextOrders.length;
        setError(null);
        setOrders(nextOrders);
      },
      () => {
        setError("Could not load live orders. Check Firestore rules and project config.");
      }
    );

    return () => unsub();
  }, []);

  const activeOrders = orders.filter((order) => order.status === "pending" || order.status === "preparing");
  const readyOrders = orders.filter((order) => order.status === "ready");

  return (
    <main className="min-h-screen p-4 md:p-6">
      <header className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">Dart Bites Kitchen Display</h1>
        <p className="text-sm text-slate-400">Live orders</p>
      </header>

      <section className="grid gap-4 lg:grid-cols-2">
        {error && (
          <div className="rounded-xl border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-200 lg:col-span-2">
            {error}
          </div>
        )}
        <div className="rounded-2xl border border-yellow-500/40 bg-slate-950/50 p-4">
          <h2 className="mb-3 text-lg font-bold text-yellow-300">New Orders</h2>
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
            {!activeOrders.length && <p className="text-sm text-slate-400">No active orders</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/40 bg-slate-950/50 p-4">
          <h2 className="mb-3 text-lg font-bold text-emerald-300">Ready</h2>
          <div className="space-y-3">
            {readyOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
            {!readyOrders.length && <p className="text-sm text-slate-400">No ready orders</p>}
          </div>
        </div>
      </section>
    </main>
  );
}

