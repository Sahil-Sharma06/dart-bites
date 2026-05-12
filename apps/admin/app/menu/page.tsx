"use client";

import { MenuItem, getClientFirestore } from "@dartbites/firebase";
import { Button, Card } from "@dartbites/ui";
import { collection, deleteDoc, doc, onSnapshot, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminShell } from "../../components/admin-shell";
import { AuthGuard } from "../../components/auth-guard";

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const db = getClientFirestore();
    const unsub = onSnapshot(collection(db, "menu"), (snap) => {
      setItems(snap.docs.map((d) => ({ ...(d.data() as MenuItem), id: d.id })));
    });

    return () => unsub();
  }, []);

  const toggleAvailability = async (item: MenuItem) => {
    const db = getClientFirestore();
    await updateDoc(doc(db, "menu", item.id), { isAvailable: !item.isAvailable });
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    const db = getClientFirestore();
    await deleteDoc(doc(db, "menu", id));
  };

  return (
    <AuthGuard>
      <AdminShell>
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black">Menu Items</h1>
            <Link href="/menu/new">
              <Button>Add New Item</Button>
            </Link>
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border p-3">
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-slate-500">
                    {item.category} • Rs {item.price}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => toggleAvailability(item)}>
                    {item.isAvailable ? "Set Unavailable" : "Set Available"}
                  </Button>
                  <Link href={`/menu/${item.id}`}>
                    <Button variant="ghost">Edit</Button>
                  </Link>
                  <Button variant="ghost" className="text-red-600" onClick={() => deleteItem(item.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </AdminShell>
    </AuthGuard>
  );
}

