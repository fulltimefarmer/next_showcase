"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, ensureSchema } from "@/lib/db";
import { accounts } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";

type AuthState = { error?: string };

function normalizeEmail(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeUsername(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  await ensureSchema();
  const username = normalizeUsername(formData.get("username"));
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  const [account] = await db
    .select()
    .from(accounts)
    .where(eq(accounts.username, username));
  if (!account || !verifyPassword(password, account.passwordHash)) {
    return { error: "Invalid username or password." };
  }

  await createSession(account.id);
  redirect(account.isAdmin ? "/admin" : "/");
}

export async function register(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  await ensureSchema();
  const username = normalizeUsername(formData.get("username"));
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!username) return { error: "Username is required." };
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { error: "Username can only contain letters, numbers and underscores." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }
  if (password !== confirm) {
    return { error: "Passwords do not match." };
  }

  const [existingUsername] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.username, username));
  if (existingUsername) {
    return { error: "This username is already taken." };
  }

  const [existingEmail] = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.email, email));
  if (existingEmail) {
    return { error: "An account with this email already exists." };
  }

  const [account] = await db
    .insert(accounts)
    .values({ username, email, passwordHash: hashPassword(password), isAdmin: false })
    .returning();

  await createSession(account.id);
  redirect("/");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
