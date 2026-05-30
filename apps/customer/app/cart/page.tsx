"use client";

import { OrderType, PaymentMethod } from "@dartbites/firebase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useCart } from "../../lib/cart-store";

const GST_RATE = 0.05;

export default function CartPage() {
  const router = useRouter();
  const { items, increment, decrement, removeItem, subtotal, clear, addOrderToHistory } = useCart();
  const [orderType, setOrderType] = useState<OrderType>("takeaway");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gst = useMemo(() => subtotal * GST_RATE, [subtotal]);
  const total = useMemo(() => subtotal + gst, [subtotal, gst]);

  const placeOrder = async () => {
    if (!items.length) return;
    setSubmitting(true);
    setError(null);

    const payload = {
      orderType,
      paymentMethod,
      totalAmount: Number(total.toFixed(2)),
      items: items.map((item) => ({
        menuItemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        price: item.unitPrice,
        selectedAddons: item.selectedAddons.map((a) => a.name)
      }))
    };

    try {
      const res = await fetch("/api/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to place order");
      const data = (await res.json()) as { docId: string; orderId: string };
      addOrderToHistory({ docId: data.docId, orderId: data.orderId, totalAmount: Number(total.toFixed(2)), placedAt: new Date().toISOString() });
      clear();
      router.push(`/order/${data.docId}`);
    } catch {
      setError("Could not place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen chalkboard-bg flex flex-col items-center justify-center px-5 text-center">
        <p className="font-sora text-4xl font-extrabold text-white uppercase chalk-text mb-3">Cart is Empty</p>
        <p className="text-on-surface-variant mb-8 text-sm">Add some bold bites to get started.</p>
        <Link href="/" className="bg-secondary text-on-secondary px-8 py-3 font-sora font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all">
          Back to Menu
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen chalkboard-bg px-5 md:px-16 py-16 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-sora text-4xl font-extrabold text-white uppercase chalk-text tracking-tighter">Your Cart</h1>
          <div className="h-[3px] w-14 bg-secondary mt-2" />
        </div>
        <Link href="/" className="text-xs text-on-surface-variant hover:text-secondary uppercase tracking-widest transition-colors">
          ← Menu
        </Link>
      </div>

      {/* Items */}
      <div className="space-y-3 mb-8">
        {items.map((item, idx) => {
          const addonTotal = item.selectedAddons.reduce((acc, a) => acc + a.price, 0);
          const lineTotal = (item.unitPrice + addonTotal) * item.quantity;
          return (
            <div key={`${item.menuItemId}-${idx}`} className="bg-surface border border-white/5 p-4 flex gap-4 items-start">
              <div className="flex-1 min-w-0">
                <p className="font-sora font-bold text-white uppercase tracking-tight text-sm">{item.name}</p>
                {item.selectedAddons.length > 0 && (
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    + {item.selectedAddons.map((a) => a.name).join(", ")}
                  </p>
                )}
                <p className="text-xs text-on-surface-variant mt-1">₹{(item.unitPrice + addonTotal).toFixed(0)} each</p>
              </div>

              {/* Qty controls */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => decrement(idx)} className="w-7 h-7 border border-white/20 text-white font-bold text-sm hover:border-secondary hover:text-secondary transition-colors flex items-center justify-center">−</button>
                <span className="font-sora font-bold text-white text-sm w-6 text-center">{item.quantity}</span>
                <button onClick={() => increment(idx)} className="w-7 h-7 border border-white/20 text-white font-bold text-sm hover:border-secondary hover:text-secondary transition-colors flex items-center justify-center">+</button>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="font-sora font-bold text-secondary text-sm">₹{lineTotal.toFixed(0)}</p>
                <button onClick={() => removeItem(idx)} className="text-[10px] text-on-surface-variant hover:text-red-400 transition-colors mt-1 uppercase tracking-widest">Remove</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary + Checkout */}
      <div className="bg-surface border border-white/10 p-6 space-y-5">
        {/* Totals */}
        <div className="space-y-2 pb-4 border-b border-white/10">
          <div className="flex justify-between text-sm text-on-surface-variant">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-on-surface-variant">
            <span>GST (5%)</span>
            <span>₹{gst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-sora font-extrabold text-white text-xl pt-2">
            <span>Total</span>
            <span className="text-secondary">₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Order type */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Order Type</p>
          <div className="flex gap-2">
            {(["dine-in", "takeaway"] as OrderType[]).map((t) => (
              <button
                key={t}
                onClick={() => setOrderType(t)}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest border transition-all ${
                  orderType === t ? "bg-secondary text-on-secondary border-secondary" : "border-white/20 text-on-surface-variant hover:border-white/50 hover:text-white"
                }`}
              >
                {t === "dine-in" ? "Dine-in" : "Takeaway"}
              </button>
            ))}
          </div>
        </div>

        {/* Payment */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Payment Method</p>
          <div className="flex gap-2">
            {(["cash", "upi"] as PaymentMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => setPaymentMethod(m)}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest border transition-all ${
                  paymentMethod === m ? "bg-secondary text-on-secondary border-secondary" : "border-white/20 text-on-surface-variant hover:border-white/50 hover:text-white"
                }`}
              >
                {m.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-400 border border-red-500/30 bg-red-500/10 px-3 py-2">{error}</p>
        )}

        <button
          disabled={submitting}
          onClick={placeOrder}
          className="w-full bg-secondary text-on-secondary py-4 font-sora font-extrabold text-sm uppercase tracking-widest hover:brightness-110 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? "Placing Order…" : "Place Order →"}
        </button>
      </div>
    </main>
  );
}
