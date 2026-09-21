import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Create account - maxopc" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.isAdmin ? "/admin" : "/");

  return (
    <main className="mx-auto flex max-w-6xl items-center justify-center px-4 py-16">
      <RegisterForm />
    </main>
  );
}
