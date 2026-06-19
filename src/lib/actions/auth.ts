"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { destroySession, getSession } from "@/lib/auth/get-session";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { getDb } from "@/lib/db";
import { initializeDatabase } from "@/lib/db/init";
import { users } from "@/lib/db/schema";
import { loginSchema } from "@/lib/validations/schemas";

export async function loginAction(formData: FormData) {
  await initializeDatabase();

  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.username, parsed.data.username),
  });

  if (!user || !user.isActive) {
    return { error: "Invalid username or password" };
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return { error: "Invalid username or password" };
  }

  const session = await getSession();
  session.userId = user.id;
  session.username = user.username;
  session.role = user.role;
  session.isLoggedIn = true;
  await session.save();

  redirect("/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function changePasswordAction(formData: FormData) {
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const session = await getSession();

  if (!session.isLoggedIn || !session.userId) {
    return { error: "Not authenticated" };
  }

  if (newPassword.length < 6) {
    return { error: "New password must be at least 6 characters" };
  }

  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.userId),
  });

  if (!user) {
    return { error: "User not found" };
  }

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    return { error: "Current password is incorrect" };
  }

  await db
    .update(users)
    .set({ passwordHash: await hashPassword(newPassword) })
    .where(eq(users.id, user.id));

  return { success: true };
}
