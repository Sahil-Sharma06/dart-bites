"use client";

import { getClientFirestore, MenuItem } from "@dartbites/firebase";
import { LoadingSpinner } from "@dartbites/ui";
import { collection, onSnapshot, query } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MenuCard } from "../components/menu-card";
import { useCart } from "../lib/cart-store";

const tabs = ["All", "Snacks", "Mains", "Drinks", "Extras"] as const;

export default function MenuPage() {
  const { addItem, count } = useCart();
  const [active, setActive] = useState<(typeof tabs)[number]>("All");
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getClientFirestore();
    const q = query(collection(db, "menu"));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((docSnap) => {
        const data = docSnap.data() as Omit<MenuItem, "id"> & { id?: string };
        return { ...data, id: data.id ?? docSnap.id };
      });
      setMenu(docs);
      setError(null);
      setLoading(false);
    }, () => {
      setError("Could not load menu items. Please check Firebase setup and rules.");
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    if (active === "All") return menu;
    return menu.filter((item) => item.category === active);
  }, [active, menu]);

  return (
    <main className="min-h-screen pb-24">
      <header className="sticky top-0 z-20 border-b border-orange-100 bg-[#FFFBF5]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-xl font-black uppercase tracking-wide text-orange-600">Dart Bites</h1>
          <Link href="/cart" className="rounded-full bg-orange-500 px-4 py-1 text-sm font-semibold text-white">
            Cart ({count})
          </Link>
        </div>
        <div className="mx-auto mt-3 flex max-w-5xl gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${
                tab === active ? "bg-orange-500 text-white" : "bg-orange-100 text-orange-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <section className="mx-auto mt-5 grid max-w-5xl grid-cols-2 gap-4 px-4 md:grid-cols-3">
        {loading && (
          <div className="col-span-full flex justify-center py-20">
            <LoadingSpinner />
          </div>
        )}
        {!loading && error && (
          <div className="col-span-full rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="col-span-full rounded-2xl border border-orange-200 bg-orange-50 p-5 text-sm text-slate-700">
            No menu items found yet. Add items from the admin app Menu page or create documents in the
            Firestore menu collection.
          </div>
        )}
        {!loading && filtered.map((item) => <MenuCard key={item.id} item={item} onAdd={addItem} />)}
      </section>
    </main>
  );
}

