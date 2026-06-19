"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { requireAdmin } from "@/lib/auth/get-session";
import { hashPassword } from "@/lib/auth/password";
import { getDb } from "@/lib/db";
import { runMigrations } from "@/lib/db/migrate";
import { users } from "@/lib/db/schema";
import { userSchema } from "@/lib/validations/schemas";
import { nowIso } from "@/lib/utils";

function ensureDb() {
  runMigrations();
}

export async function createUserAction(formData: FormData) {
  ensureDb();
  await requireAdmin();
  const parsed = userSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    role: formData.get("role"),
    isActive: formData.get("isActive") === "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  if (!parsed.data.password) return { error: "Password is required for new users" };

  const db = getDb();
  const existing = await db.query.users.findFirst({
    where: eq(users.username, parsed.data.username),
  });
  if (existing) return { error: "Username already exists" };

  await db.insert(users).values({
    id: uuidv4(),
    username: parsed.data.username,
    passwordHash: await hashPassword(parsed.data.password),
    role: parsed.data.role,
    isActive: parsed.data.isActive,
    createdAt: nowIso(),
  });

  revalidatePath("/users");
  return { success: true };
}

export async function updateUserAction(id: string, formData: FormData) {
  ensureDb();
  await requireAdmin();
  const parsed = userSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password") || undefined,
    role: formData.get("role"),
    isActive: formData.get("isActive") === "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const db = getDb();
  const updates: Partial<typeof users.$inferInsert> = {
    username: parsed.data.username,
    role: parsed.data.role,
    isActive: parsed.data.isActive,
  };

  if (parsed.data.password) {
    updates.passwordHash = await hashPassword(parsed.data.password);
  }

  await db.update(users).set(updates).where(eq(users.id, id));
  revalidatePath("/users");
  return { success: true };
}

export async function getUsersAction() {
  ensureDb();
  await requireAdmin();
  const db = getDb();
  return db.query.users.findMany({
    orderBy: (u, { asc }) => [asc(u.username)],
  });
}
