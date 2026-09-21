import type { Metadata } from "next";
import { CartView } from "./cart-view";

export const metadata: Metadata = { title: "Cart - maxopc" };

export default function CartPage() {
  return <CartView />;
}
