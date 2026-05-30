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
        <Card className="space-y-4 !border-white/10 !bg-surface/90 !text-white">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h1 className="font-sora text-2xl font-extrabold uppercase tracking-tight">Menu Items</h1>
            <Link href="/menu/new">
              <Button className="!bg-secondary !text-on-secondary text-xs font-bold uppercase tracking-widest">Add New Item</Button>
            </Link>
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col gap-4 border border-white/10 bg-background/60 p-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-on-surface-variant">
                    {item.category} • Rs {item.price}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    className="!bg-white/10 !text-white hover:!bg-white/20"
                    onClick={() => toggleAvailability(item)}
                  >
                    {item.isAvailable ? "Set Unavailable" : "Set Available"}
                  </Button>
                  <Link href={`/menu/${item.id}`}>
                    <Button className="!bg-secondary !text-on-secondary">Edit</Button>
                  </Link>
                  <Button className="!bg-transparent !text-red-300 hover:!text-red-200" onClick={() => deleteItem(item.id)}>
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

