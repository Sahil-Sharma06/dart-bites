"use client";

import { Addon, MenuItem } from "@dartbites/firebase";
import { useState } from "react";

type Props = {
  item: MenuItem;
  onAdd: (item: MenuItem, selectedAddons: Addon[]) => void;
};

function normalizeImageUrl(rawUrl: string): string | null {
  const url = rawUrl?.trim();
  if (!url) return null;
  if (url.startsWith("gs://")) {
    const withoutScheme = url.replace("gs://", "");
    const firstSlash = withoutScheme.indexOf("/");
    if (firstSlash <= 0) return null;
    const bucket = withoutScheme.slice(0, firstSlash);
    const objectPath = withoutScheme.slice(firstSlash + 1);
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(objectPath)}?alt=media`;
  }
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) return url;
  return `https://${url}`;
}

const LOCAL_IMAGE_MAP: Record<string, string> = {
  "Veg Burger": "/Veg Burger.png",
  "Cheese Veg Burger": "/2CheeseBurgers.png",
  "2 Veg Burgers": "/2VegBurgers.png",
  "2 Cheese Burgers": "/2CheeseBurgers.png",
  "Veg Burger + Rasna": "/VegBurger+Rasna.png",
  "Veg Burger + Lemon Soda": "/Burger+LemonSoda.png",
  "Cheese Burger + Rasna": "/CheeseBurger+Rasna.png",
  "Cheese Burger + Lemon Soda": "/VegCheeseBurger+LemonSoda.png",
  "Potato Cheese Shots": "/cheese Sots.png",
  "Peri Peri Cheese Shots": "/cheese Sots.png",
  "Loaded Cheese Shots": "/cheese Sots.png",
  "Potato Cheese Shots + Rasna": "/PotatoCheeseShots+Rasna.png",
  "Potato Cheese Shots + Lemon Soda": "/CheeseShots+LemonSoda.png",
  "Potato Cheese Shots + Aam Panna": "/PotatoCheeseShots+AamPanna.png",
  "Potato Cheese Shots + Sweet Lassi": "/PotatoCheeseShots+SweetLassi.png",
  "Potato Cheese Shots + Green Apple Mojito": "/PotatoCheeseShots+GreenAppleMojito.png",
  "Potato Cheese Shots + Blue Lagoon Mojito": "/PotatoCheeseShots+BlueLagoon.png",
  "Regular Fries": "/Normal Fries.png",
  "Fries": "/Normal Fries.png",
  "Peri Peri Fries": "/PiriPiri Fries.png",
  "Fries + Rasna": "/Fries+Rasna.png",
  "Fries + Lemon Soda": "/Fries+LemonSoda.png",
  "Peri Peri Fries + Rasna": "/PeriPeri+Rasna.png",
  "Peri Peri Fries + Lemon Soda": "/PeriPeri+LemonSoda.png",
  "Blue Lagoon Mojito": "/Blue Lagoon.png",
  "Green Apple Mojito": "/Green Apple Mojito.png",
  "Strawberry Slush": "/Strawberry Slush.png",
  "Litchi Slush": "/Litchi Slush.png",
  "Fresh Lemon Soda": "/Lemon Soda.png",
  "Rasna": "/Rasna.png",
  "Aam Panna": "/Aam Panna.png",
  "Sweet Lassi": "/Lassi.png",
  "Chilled Water Bottle": "/water bottle.png",
  "Fried Veg Momos (Half)": "/FriedMomos.png",
  "Fried Veg Momos (Full)": "/FriedMomos.png",
  "Kurkure Veg Momos (Half)": "/KukureFriedMomos.png",
  "Kurkure Veg Momos (Full)": "/KukureFriedMomos.png",
  "Fried Paneer Momos (Half)": "/FriedMomos.png",
  "Fried Paneer Momos (Full)": "/FriedMomos.png",
  "Kurkure Paneer Momos (Half)": "/KukureFriedMomos.png",
  "Kurkure Paneer Momos (Full)": "/KukureFriedMomos.png",
  "Vanilla Brownie Bowl": "/Vanilla Brownie bowl .png",
  "Mango Brownie Bowl": "/Mango Brownie Bowl.png",
  "Strawberry Cream Brownie Bowl": "/Strawberry Brownie Bowl.png",
  "Strawberry Chocolate Mix Bowl": "/Mango Brownie Bowl.png",
  "KitKat Chocolate Brownie Bowl": "/Vanilla Brownie bowl .png",
  "Milkybar Chocolate Brownie Bowl": "/Vanilla Brownie bowl .png",
  "Chocolate Overload Brownie Bowl": "/Vanilla Brownie bowl .png"
};

function resolveLocalImage(name: string): string | null {
  const direct = LOCAL_IMAGE_MAP[name];
  if (direct) return direct;

  const lowered = name.toLowerCase();
  if (lowered.includes("momos")) {
    if (lowered.includes("kurkure")) return "/KukureFriedMomos.png";
    if (lowered.includes("fried")) return "/FriedMomos.png";
    return "/FriedMomos.png";
  }
  if (lowered.includes("water bottle")) return "/water bottle.png";

  return null;
}

export function MenuCard({ item, onAdd }: Props) {
  const [showAddons, setShowAddons] = useState(false);
  const [selected, setSelected] = useState<Addon[]>([]);
  const [imageError, setImageError] = useState(false);
  const localImageUrl = resolveLocalImage(item.name);
  const primaryImageUrl = normalizeImageUrl(item.imageUrl) ?? localImageUrl;
  const imageUrl = imageError ? localImageUrl : primaryImageUrl;

  const toggleAddon = (addon: Addon) => {
    setSelected((prev) => {
      const exists = prev.some((a) => a.name === addon.name);
      return exists ? prev.filter((a) => a.name !== addon.name) : [...prev, addon];
    });
  };

  const handleAdd = () => {
    onAdd(item, selected);
    setSelected([]);
    setShowAddons(false);
  };

  return (
    <div className={`group relative flex flex-col bg-surface border border-white/5 hover:border-secondary/40 transition-all duration-300 ${!item.isAvailable ? "opacity-50" : ""}`}>
      {/* Image */}
      <div className="aspect-square w-full overflow-hidden bg-surface">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="h-full w-full object-cover grayscale group-hover:grayscale-0 opacity-70 group-hover:opacity-100 transition-all duration-500 scale-100 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-surface to-background">
            <span className="font-sora text-3xl font-extrabold text-white/10 uppercase tracking-tighter">
              {item.name.slice(0, 2)}
            </span>
          </div>
        )}
      </div>

      {/* Unavailable overlay */}
      {!item.isAvailable && (
        <div className="absolute inset-0 grid place-items-center bg-black/60">
          <span className="font-sora text-xs font-bold uppercase tracking-[0.2em] text-white/60 border border-white/20 px-3 py-1">
            Unavailable
          </span>
        </div>
      )}

      {/* Top accent line */}
      <div className="h-[2px] w-0 bg-secondary group-hover:w-full transition-all duration-300" />

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 gap-3">
        <div>
          <h3 className="font-sora text-sm font-bold text-white uppercase tracking-tight leading-snug group-hover:text-secondary transition-colors">
            {item.name}
          </h3>
          {item.description && (
            <p className="mt-1 text-xs text-on-surface-variant leading-relaxed line-clamp-2">
              {item.description}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between">
          <span className="price-tag font-sora text-sm font-bold text-secondary">
            ₹{item.price.toFixed(0)}
          </span>
          <button
            disabled={!item.isAvailable}
            onClick={() => (item.addons?.length ? setShowAddons((v) => !v) : onAdd(item, []))}
            className="bg-secondary text-on-secondary text-xs font-bold uppercase tracking-widest px-3 py-1.5 hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {showAddons ? "Close" : "Add"}
          </button>
        </div>

        {/* Addon picker */}
        {showAddons && (
          <div className="border-t border-white/10 pt-3 space-y-2">
            <p className="text-[10px] font-bold text-secondary uppercase tracking-[0.2em]">Add-ons</p>
            {item.addons.map((addon) => {
              const checked = selected.some((a) => a.name === addon.name);
              return (
                <label
                  key={addon.name}
                  className="flex items-center justify-between text-xs text-on-surface-variant cursor-pointer hover:text-white transition-colors py-1"
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-3 h-3 border flex items-center justify-center flex-shrink-0 transition-colors ${checked ? "bg-secondary border-secondary" : "border-white/20"}`}>
                      {checked && <span className="text-[8px] text-black font-black">✓</span>}
                    </span>
                    {addon.name}
                  </span>
                  <span className="text-secondary font-semibold">+₹{addon.price}</span>
                  <input type="checkbox" checked={checked} onChange={() => toggleAddon(addon)} className="sr-only" />
                </label>
              );
            })}
            <button
              onClick={handleAdd}
              className="w-full bg-secondary text-on-secondary text-xs font-bold uppercase tracking-widest py-2 hover:brightness-110 transition-all mt-1"
            >
              Confirm Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
