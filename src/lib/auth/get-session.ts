import "server-only";

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { UserRole } from "@/lib/db/schema";
import { defaultSession, sessionOptions, type SessionData } from "./session";

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return null;
  }
  return {
    id: session.userId,
    username: session.username ?? "",
    role: session.role ?? "cashier",
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(allowed: UserRole[]) {
  const user = await requireAuth();
  if (!allowed.includes(user.role as UserRole)) {
    redirect("/");
  }
  return user;
}

export async function requireAdmin() {
  return requireRole(["admin"]);
}

export async function destroySession() {
  const session = await getSession();
  session.userId = undefined;
  session.username = undefined;
  session.role = undefined;
  session.isLoggedIn = false;
  Object.assign(session, defaultSession);
  await session.save();
}
