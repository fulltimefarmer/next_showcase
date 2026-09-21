import type { Metadata } from "next";
import { CheckoutSummary } from "./checkout-summary";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Checkout - maxopc" };

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  return <CheckoutSummary initialEmail={user?.email ?? ""} isAuthenticated={!!user} />;
}
