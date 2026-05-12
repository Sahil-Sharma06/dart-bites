"use client";

import { Category, MenuItem, getClientFirestore } from "@dartbites/firebase";
import { Button, Card } from "@dartbites/ui";
import { addDoc, collection, doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  initial?: MenuItem;
  mode: "create" | "edit";
};

const categories: Category[] = ["Snacks", "Mains", "Drinks", "Extras"];

export function MenuForm({ initial, mode }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [category, setCategory] = useState<Category>(initial?.category ?? "Snacks");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [isAvailable, setIsAvailable] = useState(initial?.isAvailable ?? true);
  const [addonsText, setAddonsText] = useState(
    (initial?.addons ?? []).map((addon) => `${addon.name}:${addon.price}`).join("\n")
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const db = getClientFirestore();
    const addons = addonsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [addonName, addonPrice] = line.split(":");
        return { name: addonName.trim(), price: Number(addonPrice ?? 0) };
      });

    const payload = {
      id: initial?.id ?? "",
      name,
      description,
      price: Number(price),
      category,
      imageUrl,
      isAvailable,
      addons
    };

    if (mode === "create") {
      const ref = await addDoc(collection(db, "menu"), payload);
      await setDoc(doc(db, "menu", ref.id), { id: ref.id }, { merge: true });
    } else if (initial?.id) {
      await setDoc(doc(db, "menu", initial.id), { ...payload, id: initial.id }, { merge: true });
    }

    router.push("/menu");
  };

  return (
    <Card>
      <form className="space-y-3" onSubmit={onSubmit}>
        <input className="w-full rounded-lg border px-3 py-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <textarea className="w-full rounded-lg border px-3 py-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <input className="w-full rounded-lg border px-3 py-2" placeholder="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        <select className="w-full rounded-lg border px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value as Category)}>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <input className="w-full rounded-lg border px-3 py-2" placeholder="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isAvailable} onChange={(e) => setIsAvailable(e.target.checked)} />
          Available
        </label>
        <textarea
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Addons as name:price, one per line"
          value={addonsText}
          onChange={(e) => setAddonsText(e.target.value)}
        />
        <Button type="submit" className="w-full">
          {mode === "create" ? "Create Item" : "Save Changes"}
        </Button>
      </form>
    </Card>
  );
}

