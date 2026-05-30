"use client";

import { Addon, MenuItem } from "@dartbites/firebase";
import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";

const CART_KEY = "dartbites-cart";
const HISTORY_KEY = "dartbites-order-history";

export type CartItem = {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  selectedAddons: Addon[];
};

export type OrderHistoryEntry = {
  docId: string;
  orderId: string;
  totalAmount: number;
  placedAt: string; // ISO string
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
  addOrderToHistory: (entry: OrderHistoryEntry) => void;
  orderHistory: OrderHistoryEntry[];
};

const CartContext = createContext<CartContextType | null>(null);

function addonKey(addons: Addon[]): string {
  return JSON.stringify(
    [...addons].sort((a, b) => a.name.localeCompare(b.name)).map((a) => a.name)
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryEntry[]>([]);

  // Hydrate cart from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      localStorage.removeItem(CART_KEY);
    }
  }, []);

  // Hydrate order history from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setOrderHistory(JSON.parse(raw) as OrderHistoryEntry[]);
    } catch {
      localStorage.removeItem(HISTORY_KEY);
    }
  }, []);

  // Persist cart
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  // Persist order history
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(orderHistory));
  }, [orderHistory]);

  // FIX: merge duplicate items (same menuItemId + same addons)
  const addItem = (item: MenuItem, selectedAddons: Addon[]) => {
    setItems((prev) => {
      const newKey = addonKey(selectedAddons);
      const existingIdx = prev.findIndex(
        (ci) => ci.menuItemId === item.id && addonKey(ci.selectedAddons) === newKey
      );
      if (existingIdx !== -1) {
        return prev.map((ci, i) =>
          i === existingIdx ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          quantity: 1,
          unitPrice: item.price,
          selectedAddons: [...selectedAddons].sort((a, b) => a.name.localeCompare(b.name))
        }
      ];
    });
  };

  const increment = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: item.quantity + 1 } : item))
    );
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

  const addOrderToHistory = (entry: OrderHistoryEntry) => {
    setOrderHistory((prev) => [entry, ...prev].slice(0, 20)); // Keep last 20
  };

  const count = useMemo(() => items.reduce((acc, item) => acc + item.quantity, 0), [items]);

  const subtotal = useMemo(
    () =>
      items.reduce((acc, item) => {
        const addonTotal = item.selectedAddons.reduce((s, a) => s + a.price, 0);
        return acc + (item.unitPrice + addonTotal) * item.quantity;
      }, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ items, addItem, increment, decrement, removeItem, clear, count, subtotal, addOrderToHistory, orderHistory }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
}
