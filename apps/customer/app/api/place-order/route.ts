import { NextRequest, NextResponse } from "next/server";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

type PlaceOrderRequest = {
  items: Array<{
    menuItemId: string;
    name: string;
    quantity: number;
    price: number;
    selectedAddons: string[];
  }>;
  totalAmount: number;
  orderType: "dine-in" | "takeaway";
  paymentMethod: "cash" | "upi";
};

function getAdminDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
      })
    });
  }
  return getFirestore();
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PlaceOrderRequest;
    const validOrderType = body.orderType === "dine-in" || body.orderType === "takeaway";
    if (!body.items?.length || !body.totalAmount || !body.paymentMethod || !validOrderType) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const db = getAdminDb();
    const result = await db.runTransaction(async (tx) => {
      const counterRef = db.collection("config").doc("orderCounter");
      const counterSnap = await tx.get(counterRef);
      const current = counterSnap.exists ? Number(counterSnap.data()?.lastOrderNumber ?? 100) : 100;
      const next = current + 1;
      const orderId = `DB${next}`;

      const orderRef = db.collection("orders").doc();
      tx.set(orderRef, {
        orderId,
        items: body.items,
        totalAmount: body.totalAmount,
        status: "pending",
        orderType: body.orderType,
        paymentMethod: body.paymentMethod,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });

      tx.set(counterRef, { lastOrderNumber: next }, { merge: true });
      return { docId: orderRef.id, orderId };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
