"use client";

import { getClientFirestore, MenuItem } from "@dartbites/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MenuCard } from "../components/menu-card";
import { useCart } from "../lib/cart-store";

const CATEGORIES = ["All", "Snacks", "Mains", "Drinks", "Extras"] as const;
type ActiveCat = (typeof CATEGORIES)[number];

export default function MenuPage() {
  const { addItem, count } = useCart();
  const [active, setActive] = useState<ActiveCat>("All");
  const [search, setSearch] = useState("");
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getClientFirestore();
    const q = query(collection(db, "menu"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => {
          const data = d.data() as Omit<MenuItem, "id"> & { id?: string };
          return { ...data, id: data.id ?? d.id };
        });
        setMenu(docs);
        setError(null);
        setLoading(false);
      },
      (err) => {
        const message = err instanceof Error ? err.message : "Could not load menu. Please check your connection.";
        console.error("Menu listener failed:", err);
        setError(message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const available = useMemo(() => menu.filter((i) => i.isAvailable !== false), [menu]);

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    return available.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.description?.toLowerCase() ?? "").includes(q)
    );
  }, [available, search]);

  const grouped = useMemo(() => {
    if (searchResults) return null;
    const cats =
      active === "All"
        ? (["Snacks", "Mains", "Drinks", "Extras"] as const)
        : ([active] as ("Snacks" | "Mains" | "Drinks" | "Extras")[]);
    return cats
      .map((cat) => ({ cat, items: available.filter((i) => i.category === cat) }))
      .filter((g) => g.items.length > 0);
  }, [available, active, searchResults]);

  return (
    <main className="min-h-screen chalkboard-bg">
      {/* ── Nav — fixed, ~57px tall (py-4 + text) ────── */}
      <nav className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-md border-b border-white/5 px-5 md:px-16 py-4 flex items-center justify-between gap-4">
        <div className="font-sora text-xl font-extrabold tracking-tighter text-secondary uppercase italic flex-shrink-0">
          Dart Bites
        </div>

        {/* Desktop search */}
        <div className="hidden md:flex items-center flex-1 max-w-sm border border-white/10 bg-surface px-4 py-2">
          <svg className="w-4 h-4 text-on-surface-variant mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search menu…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-white placeholder-on-surface-variant w-full"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-on-surface-variant hover:text-white ml-2 text-xs">✕</button>
          )}
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <Link href="/orders" className="hidden md:block text-xs text-on-surface-variant hover:text-secondary uppercase tracking-widest transition-colors">
            My Orders
          </Link>
          <Link href="/cart">
            <button className="bg-secondary text-on-secondary px-5 py-2 font-sora font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2">
              Cart
              {count > 0 && (
                <span className="bg-on-secondary text-secondary font-black w-5 h-5 flex items-center justify-center text-[10px]">
                  {count}
                </span>
              )}
            </button>
          </Link>
        </div>
      </nav>

      {/* ── Category Tabs — sticky just below the fixed nav ── */}
      {/*    Nav is ~57px. Tabs stick at top-[57px].           */}
      <div className="pt-[57px]">  {/* push everything below the fixed nav */}
        <div className="sticky top-[57px] z-40 bg-background/95 backdrop-blur-sm border-b border-white/5 px-5 md:px-16 py-3">
          {/* Single horizontal row — no wrapping, no mobile search here */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setActive(cat); setSearch(""); }}
                className={`whitespace-nowrap px-4 py-1.5 text-xs font-bold uppercase tracking-widest border transition-all flex-shrink-0 ${
                  cat === active && !search
                    ? "bg-secondary text-on-secondary border-secondary"
                    : "text-on-surface-variant border-white/10 hover:text-white hover:border-white/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Page Body ──────────────────────────────────── */}
        <div className="px-5 md:px-16 pt-10 pb-16 max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-10">
          <h1 className="font-sora text-4xl md:text-7xl font-extrabold text-white uppercase chalk-text tracking-tighter mb-3">
            {search ? "Results" : active === "All" ? "The Menu" : active}
          </h1>
          <div className="h-[3px] w-20 bg-secondary mb-4" />
          <p className="text-on-surface-variant max-w-lg font-light text-sm md:text-base">
            Authentic street flavors. Zero fluff. Just bold energy served daily.
          </p>
          {/* Mobile search — inside content, never in sticky bar */}
          <div className="md:hidden flex items-center border border-white/10 bg-surface px-4 py-2.5 mt-5">
            <svg className="w-4 h-4 text-on-surface-variant mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search menu…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-sm text-white placeholder-on-surface-variant w-full"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-on-surface-variant hover:text-white ml-2 text-sm">✕</button>
            )}
          </div>
        </header>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-secondary border-t-transparent animate-spin" />
              <p className="text-xs text-on-surface-variant uppercase tracking-widest">Loading menu…</p>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Search results */}
        {!loading && !error && searchResults && (
          <>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-8">
              {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for "{search}"
            </p>
            {searchResults.length === 0 ? (
              <div className="border border-white/10 p-8 text-center">
                <p className="font-sora text-xl font-bold text-white uppercase mb-2">Nothing found</p>
                <p className="text-sm text-on-surface-variant">Try a different search term.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.map((item) => (
                  <MenuCard key={item.id} item={item} onAdd={addItem} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Grouped sections */}
        {!loading && !error && !searchResults && grouped && (
          <div className="space-y-16">
            {grouped.length === 0 && (
              <div className="border border-white/10 p-8 text-center">
                <p className="font-sora text-xl font-bold text-white uppercase mb-2">Nothing here yet</p>
                <p className="text-sm text-on-surface-variant">Check back soon or add items from the admin panel.</p>
              </div>
            )}
            {grouped.map(({ cat, items }) => (
              <section key={cat}>
                {/* Section header */}
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="font-sora text-2xl md:text-3xl font-bold uppercase text-secondary tracking-tight flex-shrink-0">
                    {cat}
                  </h2>
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-on-surface-variant uppercase tracking-widest flex-shrink-0">
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {items.map((item) => (
                    <MenuCard key={item.id} item={item} onAdd={addItem} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ────────────────────────────────────── */}
      <footer className="border-t border-white/5 px-5 md:px-16 py-16 mt-16">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10">
          <div className="max-w-xs">
            <p className="font-sora text-lg font-extrabold text-secondary uppercase italic tracking-tighter mb-3">Dart Bites</p>
            <p className="text-sm text-on-surface-variant leading-relaxed">Fueling the city with high-octane street food. Born in the streets, made for the bold.</p>
          </div>
          <div className="flex gap-16">
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Navigate</h4>
              <nav className="flex flex-col gap-2">
                <Link href="/" className="text-sm text-on-surface-variant hover:text-secondary transition-colors">Menu</Link>
                <Link href="/orders" className="text-sm text-on-surface-variant hover:text-secondary transition-colors">My Orders</Link>
                <Link href="/cart" className="text-sm text-on-surface-variant hover:text-secondary transition-colors">Cart</Link>
              </nav>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-white/5 flex justify-between">
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">© 2024 Dart Bites</p>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">Crafted for the bold</p>
        </div>
      </footer>
      </div>{/* end pt-[57px] wrapper */}
    </main>
  );
}
