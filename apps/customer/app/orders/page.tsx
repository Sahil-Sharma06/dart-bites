"use client";

import Link from "next/link";
import { useCart } from "../../lib/cart-store";

export default function OrdersPage() {
  const { orderHistory } = useCart();

  return (
    <main className="min-h-screen chalkboard-bg px-5 md:px-16 py-20 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-sora text-4xl font-extrabold text-white uppercase chalk-text tracking-tighter">My Orders</h1>
          <div className="h-[3px] w-14 bg-secondary mt-2" />
        </div>
        <Link href="/" className="text-xs text-on-surface-variant hover:text-secondary uppercase tracking-widest transition-colors">
          ← Menu
        </Link>
      </div>

      {orderHistory.length === 0 ? (
        <div className="border border-white/10 p-12 text-center">
          <p className="font-sora text-2xl font-bold text-white uppercase chalk-text mb-3">No Orders Yet</p>
          <p className="text-sm text-on-surface-variant mb-8">Your order history will appear here after you place your first order.</p>
          <Link href="/" className="bg-secondary text-on-secondary px-8 py-3 font-sora font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all inline-block">
            Explore Menu
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-6">
            {orderHistory.length} recent order{orderHistory.length !== 1 ? "s" : ""} (stored locally)
          </p>
          {orderHistory.map((entry) => {
            const date = new Date(entry.placedAt);
            const dateStr = date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
            const timeStr = date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
            return (
              <Link key={entry.docId} href={`/order/${entry.docId}`}>
                <div className="bg-surface border border-white/5 hover:border-secondary/40 p-5 flex items-center justify-between gap-4 transition-all group">
                  <div>
                    <p className="font-sora font-extrabold text-secondary text-xl tracking-tight">{entry.orderId}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{dateStr} · {timeStr}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-sora font-bold text-white text-sm">₹{entry.totalAmount.toFixed(2)}</p>
                    <p className="text-[10px] text-secondary uppercase tracking-widest mt-1 group-hover:underline">Track →</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
