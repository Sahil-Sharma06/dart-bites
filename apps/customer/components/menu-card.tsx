"use client";

import { Addon, MenuItem } from "@dartbites/firebase";
import { Button, Card } from "@dartbites/ui";
import { useState } from "react";

type Props = {
  item: MenuItem;
  onAdd: (item: MenuItem, selectedAddons: Addon[]) => void;
};

function normalizeImageUrl(rawUrl: string): string | null {
  const url = rawUrl.trim();
  if (!url) return null;

  if (url.startsWith("gs://")) {
    const withoutScheme = url.replace("gs://", "");
    const firstSlash = withoutScheme.indexOf("/");
    if (firstSlash <= 0) return null;

    const bucket = withoutScheme.slice(0, firstSlash);
    const objectPath = withoutScheme.slice(firstSlash + 1);
    return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(objectPath)}?alt=media`;
  }

  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) {
    return url;
  }

  return `https://${url}`;
}

export function MenuCard({ item, onAdd }: Props) {
  const [showAddons, setShowAddons] = useState(false);
  const [selected, setSelected] = useState<Addon[]>([]);
  const [imageError, setImageError] = useState(false);
  const imageUrl = normalizeImageUrl(item.imageUrl);

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
    <Card className="relative overflow-hidden p-0">
      <div className="h-36 w-full">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-orange-200 to-orange-100 text-center text-xs font-semibold uppercase tracking-wide text-orange-700">
            Image unavailable
          </div>
        )}
      </div>
      {!item.isAvailable && (
        <div className="absolute inset-0 grid place-items-center bg-black/45 text-sm font-bold uppercase tracking-wide text-white">
          Unavailable
        </div>
      )}
      <div className="space-y-3 p-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{item.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-slate-600">{item.description}</p>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-orange-600">Rs {item.price.toFixed(2)}</span>
          <Button
            disabled={!item.isAvailable}
            onClick={() => (item.addons.length ? setShowAddons((v) => !v) : onAdd(item, []))}
          >
            Add
          </Button>
        </div>
        {showAddons && (
          <div className="space-y-2 rounded-xl bg-orange-50 p-3">
            <p className="text-xs font-semibold text-slate-800">Choose addons</p>
            {item.addons.map((addon) => {
              const checked = selected.some((a) => a.name === addon.name);
              return (
                <label key={addon.name} className="flex items-center justify-between text-xs text-slate-700">
                  <span>
                    {addon.name} (+Rs {addon.price})
                  </span>
                  <input type="checkbox" checked={checked} onChange={() => toggleAddon(addon)} />
                </label>
              );
            })}
            <Button className="w-full" onClick={handleAdd}>
              Confirm Add
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
