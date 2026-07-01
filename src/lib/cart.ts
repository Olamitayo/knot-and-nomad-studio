import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string; // composite: productId|size|color
  productId: string;
  name: string;
  image: string;
  unitPrice: number;
  size?: string;
  color?: string;
  quantity: number;
  customizationNotes?: string;
  customDesignUrl?: string;
}

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, "id">) => void;
  remove: (id: string) => void;
  setQuantity: (id: string, qty: number) => void;
  clear: () => void;
}

const itemKey = (productId: string, size?: string, color?: string) =>
  `${productId}|${size ?? ""}|${color ?? ""}`;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const id = itemKey(item.productId, item.size, item.color);
          const existing = s.items.find((i) => i.id === id);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i,
              ),
            };
          }
          return { items: [...s.items, { ...item, id }] };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setQuantity: (id, qty) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i))
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "kn-cart" },
  ),
);

export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

export const cartCount = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.quantity, 0);
