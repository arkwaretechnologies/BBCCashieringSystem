"use server";

import { desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { requireAdmin, requireAuth } from "@/lib/auth/get-session";
import { getDb } from "@/lib/db";
import { runMigrations } from "@/lib/db/migrate";
import { expenseCategories, expenses } from "@/lib/db/schema";
import { expenseCategorySchema, expenseSchema } from "@/lib/validations/schemas";
import { nowIso } from "@/lib/utils";

function ensureDb() {
  runMigrations();
}

export async function createExpenseCategoryAction(formData: FormData) {
  ensureDb();
  await requireAdmin();
  const parsed = expenseCategorySchema.safeParse({
    name: formData.get("name"),
    isActive: formData.get("isActive") === "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const db = getDb();
  await db.insert(expenseCategories).values({
    id: uuidv4(),
    ...parsed.data,
    createdAt: nowIso(),
  });

  revalidatePath("/expenses");
  return { success: true };
}

export async function createExpenseAction(formData: FormData) {
  ensureDb();
  const user = await requireAuth();
  const parsed = expenseSchema.safeParse({
    categoryId: formData.get("categoryId"),
    amount: formData.get("amount"),
    description: formData.get("description") ?? "",
    expenseDate: formData.get("expenseDate"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const now = nowIso();
  const db = getDb();
  await db.insert(expenses).values({
    id: uuidv4(),
    ...parsed.data,
    createdBy: user.id,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/expenses");
  revalidatePath("/reports");
  revalidatePath("/");
  return { success: true };
}

export async function updateExpenseAction(id: string, formData: FormData) {
  ensureDb();
  await requireAuth();
  const parsed = expenseSchema.safeParse({
    categoryId: formData.get("categoryId"),
    amount: formData.get("amount"),
    description: formData.get("description") ?? "",
    expenseDate: formData.get("expenseDate"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const db = getDb();
  await db
    .update(expenses)
    .set({ ...parsed.data, updatedAt: nowIso() })
    .where(eq(expenses.id, id));

  revalidatePath("/expenses");
  revalidatePath("/reports");
  revalidatePath("/");
  return { success: true };
}

export async function deleteExpenseAction(id: string) {
  ensureDb();
  await requireAdmin();
  const db = getDb();
  await db.delete(expenses).where(eq(expenses.id, id));
  revalidatePath("/expenses");
  revalidatePath("/reports");
  return { success: true };
}

export async function getExpensesAction() {
  ensureDb();
  await requireAuth();
  const db = getDb();
  return db.query.expenses.findMany({
    orderBy: [desc(expenses.expenseDate)],
    with: {
      category: true,
      createdByUser: true,
    },
  });
}

export async function getExpenseCategoriesAction() {
  ensureDb();
  await requireAuth();
  const db = getDb();
  return db.query.expenseCategories.findMany({
    orderBy: (c, { asc }) => [asc(c.name)],
  });
}

export async function getMonthlyExpenseReportAction(yearMonth: string) {
  ensureDb();
  await requireAuth();
  const db = getDb();
  return db
    .select({
      categoryName: expenseCategories.name,
      total: sql<number>`coalesce(sum(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .innerJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
    .where(sql`strftime('%Y-%m', ${expenses.expenseDate}) = ${yearMonth}`)
    .groupBy(expenseCategories.id, expenseCategories.name);
}
