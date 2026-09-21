import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { db, ensureSchema } from "@/lib/db";
import { sessions, accounts } from "@/lib/db/schema";

const COOKIE_NAME = "maxopc_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.insert(sessions).values({ token, userId, expiresAt });
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function getCurrentUser() {
  await ensureSchema();
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token));
  if (!session || session.expiresAt.getTime() < Date.now()) return null;

  const [user] = await db.select().from(accounts).where(eq(accounts.id, session.userId));
  return user ?? null;
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }
  store.delete(COOKIE_NAME);
}
