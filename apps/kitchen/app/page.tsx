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
  const totalOrders = orders.length;

  return (
    <main className="min-h-screen chalkboard-bg">
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-background/90 px-5 py-4 backdrop-blur-md md:px-16">
        <div className="flex items-center justify-between gap-4">
          <div className="font-sora text-xl font-extrabold uppercase italic tracking-tighter text-secondary">
            Dart Bites
          </div>
          <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-on-surface-variant">
            <span className="hidden items-center gap-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
              Live orders
            </span>
            <span className="border border-white/10 px-3 py-1 text-white">Total {totalOrders}</span>
          </div>
        </div>
      </nav>

      <div className="pt-[57px]">
        <header className="mx-auto max-w-6xl px-5 pb-6 pt-10 md:px-16 float-in">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-sora text-3xl font-extrabold uppercase tracking-tighter text-white md:text-5xl chalk-text">
                Kitchen Display
              </h1>
              <div className="mb-4 mt-3 h-[3px] w-20 bg-secondary" />
              <p className="max-w-lg text-sm text-on-surface-variant md:text-base">
                Real-time tickets for the line. Keep them moving.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs uppercase tracking-widest">
              <div className="border border-white/10 bg-surface px-4 py-3 text-center">
                <p className="text-on-surface-variant">Active</p>
                <p className="font-sora text-lg font-bold text-white">{activeOrders.length}</p>
              </div>
              <div className="border border-white/10 bg-surface px-4 py-3 text-center">
                <p className="text-on-surface-variant">Ready</p>
                <p className="font-sora text-lg font-bold text-white">{readyOrders.length}</p>
              </div>
              <div className="border border-white/10 bg-surface px-4 py-3 text-center">
                <p className="text-on-surface-variant">Total</p>
                <p className="font-sora text-lg font-bold text-white">{totalOrders}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-5 pb-16 md:px-16">
          {error && (
            <div className="mb-6 border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300 float-in delay-1">
              {error}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2 float-in delay-1">
            <div className="border border-white/10 bg-surface/80 p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-sora text-xl font-bold uppercase tracking-tight text-secondary">New Orders</h2>
                <span className="text-xs uppercase tracking-widest text-on-surface-variant">
                  {activeOrders.length} active
                </span>
              </div>
              <div className="space-y-3">
                {activeOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
                {!activeOrders.length && <p className="text-sm text-on-surface-variant">No active orders</p>}
              </div>
            </div>

            <div className="border border-white/10 bg-surface/80 p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-sora text-xl font-bold uppercase tracking-tight text-emerald-300">Ready</h2>
                <span className="text-xs uppercase tracking-widest text-on-surface-variant">
                  {readyOrders.length} ready
                </span>
              </div>
              <div className="space-y-3">
                {readyOrders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
                {!readyOrders.length && <p className="text-sm text-on-surface-variant">No ready orders</p>}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

