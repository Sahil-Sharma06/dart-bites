import {
  Firestore,
  doc,
  runTransaction,
  serverTimestamp,
  collection,
  type Transaction
} from "firebase/firestore";
import { Order, OrderCounterConfig, OrderItem, OrderType, PaymentMethod } from "./types";

const COUNTER_PATH = ["config", "orderCounter"] as const;

async function incrementAndFormatOrderId(db: Firestore, tx: Transaction): Promise<string> {
  const counterRef = doc(db, ...COUNTER_PATH);
  const snap = await tx.get(counterRef);
  const current = (snap.data() as OrderCounterConfig | undefined)?.lastOrderNumber ?? 100;
  const next = current + 1;
  tx.set(counterRef, { lastOrderNumber: next }, { merge: true });
  return `DB${next}`;
}

export async function generateOrderId(db: Firestore): Promise<string> {
  return runTransaction(db, async (tx) => incrementAndFormatOrderId(db, tx));
}

export async function createOrderWithCounter(
  db: Firestore,
  payload: {
    items: OrderItem[];
    totalAmount: number;
    orderType: OrderType;
    paymentMethod: PaymentMethod;
  }
): Promise<{ docId: string; orderId: string }> {
  return runTransaction(db, async (tx) => {
    const orderId = await incrementAndFormatOrderId(db, tx);
    const orderRef = doc(collection(db, "orders"));

    const order: Omit<Order, "id"> = {
      orderId,
      items: payload.items,
      totalAmount: payload.totalAmount,
      status: "pending",
      orderType: payload.orderType,
      paymentMethod: payload.paymentMethod,
      createdAt: serverTimestamp() as never,
      updatedAt: serverTimestamp() as never
    };

    tx.set(orderRef, order);
    return { docId: orderRef.id, orderId };
  });
}

