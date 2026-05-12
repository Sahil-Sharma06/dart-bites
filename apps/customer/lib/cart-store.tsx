"use client";

import { Addon, MenuItem } from "@dartbites/firebase";
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";

const CART_KEY = "dartbites-cart";

export type CartItem = {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  selectedAddons: Addon[];
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: MenuItem, selectedAddons: Addon[]) => void;
  increment: (index: number) => void;
  decrement: (index: number) => void;
  removeItem: (index: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return;
    try {
      setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      localStorage.removeItem(CART_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: MenuItem, selectedAddons: Addon[]) => {
    setItems((prev) => [
      ...prev,
      {
        menuItemId: item.id,
        name: item.name,
        quantity: 1,
        unitPrice: item.price,
        selectedAddons
      }
    ]);
  };

  const increment = (index: number) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, quantity: item.quantity + 1 } : item)));
  };

  const decrement = (index: number) => {
    setItems((prev) =>
      prev
        .map((item, i) => (i === index ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const clear = () => setItems([]);

  const count = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);
  const subtotal = useMemo(
    () =>
      items.reduce((acc, item) => {
        const addons = item.selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
        return acc + (item.unitPrice + addons) * item.quantity;
      }, 0),
    [items]
  );

  const value = { items, addItem, increment, decrement, removeItem, clear, count, subtotal };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error("useCart must be used within CartProvider");
  }
  return value;
}
