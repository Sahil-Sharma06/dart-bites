"use client";

import { getClientFirestore, Order } from "@dartbites/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";

const STEPS = ["pending", "preparing", "ready", "completed"] as const;
const STEP_LABELS: Record<string, string> = {
  pending: "Order Received",
  preparing: "Preparing",
  ready: "Ready for Pickup",
  completed: "Completed"
};

export default function OrderPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getClientFirestore();
    const ref = doc(db, "orders", params.id);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        if (!snap.exists()) { setError("Order not found."); return; }
        setError(null);
        setOrder({ ...(snap.data() as Order), id: snap.id });
      },
      () => setError("Could not load live status. Check Firebase configuration.")
    );
    return () => unsub();
  }, [params.id]);

  if (error) {
    return (
      <main className="min-h-screen chalkboard-bg flex items-center justify-center px-5">
        <div className="border border-red-500/30 bg-red-500/10 p-8 text-center max-w-md">
          <p className="font-sora font-bold text-white uppercase mb-2">Oops</p>
          <p className="text-sm text-red-300 mb-6">{error}</p>
          <Link href="/" className="text-xs text-secondary uppercase tracking-widest hover:underline">Back to Menu</Link>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen chalkboard-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-secondary border-t-transparent animate-spin" />
          <p className="text-xs text-on-surface-variant uppercase tracking-widest">Loading order…</p>
        </div>
      </main>
    );
  }

  const activeIdx = STEPS.indexOf(order.status as typeof STEPS[number]);

  return (
    <main className="min-h-screen chalkboard-bg px-5 md:px-16 py-20 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg space-y-6">
        {/* Order ID card */}
        <div className="bg-surface border border-white/10 p-8 text-center">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.25em] mb-3">Order Confirmed</p>
          <p className="font-sora text-6xl font-extrabold text-secondary chalk-text tracking-tighter">
            {order.orderId}
          </p>
          <p className="text-xs text-on-surface-variant mt-2 uppercase tracking-widest">
            {order.orderType === "dine-in" ? "Dine-in" : order.orderType === "takeaway" ? "Takeaway" : "—"}
          </p>
        </div>

        {/* Status tracker */}
        <div className="bg-surface border border-white/10 p-6">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-6">Live Status</p>
          <div className="space-y-4">
            {STEPS.map((step, idx) => {
              const done = idx < activeIdx;
              const current = idx === activeIdx;
              return (
                <div key={step} className="flex items-center gap-4">
                  <div className={`w-5 h-5 flex-shrink-0 flex items-center justify-center border transition-colors ${
                    current ? "bg-secondary border-secondary" :
                    done ? "bg-secondary/30 border-secondary/30" : "border-white/20"
                  }`}>
                    {done && <span className="text-[8px] text-secondary font-black">✓</span>}
                    {current && <span className="w-2 h-2 bg-on-secondary" />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-bold uppercase tracking-wide transition-colors ${
                      current ? "text-secondary" : done ? "text-white/50" : "text-white/20"
                    }`}>
                      {STEP_LABELS[step]}
                    </p>
                  </div>
                  {current && (
                    <div className="w-2 h-2 bg-secondary animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-on-surface-variant mt-6 uppercase tracking-widest">
            Live updates active — no need to refresh.
          </p>
        </div>

        {/* Order summary */}
        <div className="bg-surface border border-white/10 p-6">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em] mb-4">Order Summary</p>
          <ul className="space-y-2 mb-4">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between text-sm text-on-surface-variant">
                <span>{item.quantity}× {item.name}{item.selectedAddons?.length ? ` (+${item.selectedAddons.join(", ")})` : ""}</span>
                <span>₹{((item.price ?? 0) * item.quantity).toFixed(0)}</span>
              </li>
            ))}
          </ul>
          <div className="pt-3 border-t border-white/10 flex justify-between font-sora font-bold text-white">
            <span>Total</span>
            <span className="text-secondary">₹{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <Link href="/">
          <button className="w-full bg-secondary text-on-secondary py-4 font-sora font-extrabold text-sm uppercase tracking-widest hover:brightness-110 transition-all">
            Order Another →
          </button>
        </Link>
      </div>
    </main>
  );
}
