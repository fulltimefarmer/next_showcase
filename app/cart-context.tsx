"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  key: string;
  productId: number;
  skuId: string | null;
  name: string;
  price: number;
  quantity: number;
};

type AddItemInput = {
  productId: number;
  skuId?: string | null;
  name: string;
  price: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: AddItemInput) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      addItem: (item) => {
        const key = `${item.productId}:${item.skuId ?? ""}`;
        setItems((prev) => {
          const existing = prev.find((i) => i.key === key);
          if (existing) {
            return prev.map((i) =>
              i.key === key ? { ...i, quantity: i.quantity + 1 } : i,
            );
          }
          return [
            ...prev,
            {
              key,
              productId: item.productId,
              skuId: item.skuId ?? null,
              name: item.name,
              price: item.price,
              quantity: 1,
            },
          ];
        });
      },
      removeItem: (key) => {
        setItems((prev) => prev.filter((i) => i.key !== key));
      },
      setQuantity: (key, quantity) => {
        setItems((prev) =>
          quantity <= 0
            ? prev.filter((i) => i.key !== key)
            : prev.map((i) => (i.key === key ? { ...i, quantity } : i)),
        );
      },
      clearCart: () => {
        setItems([]);
      },
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
