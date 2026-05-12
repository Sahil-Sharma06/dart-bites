import { Timestamp } from "firebase/firestore";

export type Category = "Snacks" | "Mains" | "Drinks" | "Extras";

export type Addon = {
  name: string;
  price: number;
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string;
  isAvailable: boolean;
  addons: Addon[];
};

export type OrderStatus = "pending" | "preparing" | "ready" | "completed";

export type PaymentMethod = "cash" | "upi";

export type OrderType = "dine-in" | "takeaway";

export type OrderItem = {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  selectedAddons: string[];
};

export type Order = {
  id?: string;
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type OrderCounterConfig = {
  lastOrderNumber: number;
};

