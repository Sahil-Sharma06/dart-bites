"use client";

import { OrderType, PaymentMethod } from "@dartbites/firebase";
import { Button, Card } from "@dartbites/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useCart } from "../../lib/cart-store";

const GST_RATE = 0.05;

export default function CartPage() {
  const router = useRouter();
  const { items, increment, decrement, removeItem, subtotal, clear } = useCart();
  const [orderType, setOrderType] = useState<OrderType>("takeaway");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [submitting, setSubmitting] = useState(false);

  const gst = useMemo(() => subtotal * GST_RATE, [subtotal]);
  const total = useMemo(() => subtotal + gst, [subtotal, gst]);

  const placeOrder = async () => {
    if (!items.length) return;
    setSubmitting(true);

    const payload = {
      orderType,
      paymentMethod,
      totalAmount: Number(total.toFixed(2)),
      items: items.map((item) => ({
        menuItemId: item.menuItemId,
        name: item.name,
        quantity: item.quantity,
        price: item.unitPrice,
        selectedAddons: item.selectedAddons.map((addon) => addon.name)
      }))
    };

    try {
      const res = await fetch("/api/place-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to place order");
      const data = (await res.json()) as { docId: string };
      clear();
      router.push(`/order/${data.docId}`);
    } catch (error) {
      console.error(error);
      alert("Could not place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900">Your Cart</h1>
        <Link href="/" className="text-sm font-semibold text-orange-600">
          Back to menu
        </Link>
      </div>

      {items.length === 0 && <Card>Your cart is empty.</Card>}

      {items.map((item, idx) => {
        const addonTotal = item.selectedAddons.reduce((acc, addon) => acc + addon.price, 0);
        return (
          <Card key={`${item.menuItemId}-${idx}`} className="space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-900">{item.name}</p>
                <p className="text-sm text-slate-500">
                  Rs {(item.unitPrice + addonTotal).toFixed(2)} each
                </p>
              </div>
              <button className="text-xs text-red-500" onClick={() => removeItem(idx)}>
                Remove
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Addons: {item.selectedAddons.length ? item.selectedAddons.map((a) => a.name).join(", ") : "None"}
            </p>
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={() => decrement(idx)}>
                -
              </Button>
              <span className="font-semibold">{item.quantity}</span>
              <Button variant="secondary" onClick={() => increment(idx)}>
                +
              </Button>
            </div>
          </Card>
        );
      })}

      {items.length > 0 && (
        <Card className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span>Rs {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>GST (5%)</span>
            <span>Rs {gst.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Total</span>
            <span>Rs {total.toFixed(2)}</span>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">Order Type</p>
            <div className="flex gap-2">
              <Button variant={orderType === "dine-in" ? "primary" : "secondary"} onClick={() => setOrderType("dine-in")}>
                Dine-in
              </Button>
              <Button variant={orderType === "takeaway" ? "primary" : "secondary"} onClick={() => setOrderType("takeaway")}>
                Takeaway
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">Payment Method</p>
            <div className="flex gap-2">
              <Button variant={paymentMethod === "cash" ? "primary" : "secondary"} onClick={() => setPaymentMethod("cash")}>
                Cash
              </Button>
              <Button variant={paymentMethod === "upi" ? "primary" : "secondary"} onClick={() => setPaymentMethod("upi")}>
                UPI
              </Button>
            </div>
          </div>

          <Button className="w-full" disabled={submitting} onClick={placeOrder}>
            {submitting ? "Placing..." : "Place Order"}
          </Button>
        </Card>
      )}
    </main>
  );
}
