import "server-only";

import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { hashPassword } from "@/lib/auth/password";
import { getDb } from "@/lib/db";
import { appSettings, expenseCategories, users } from "@/lib/db/schema";
import { nowIso } from "@/lib/utils";
import { runMigrations } from "./migrate";

let initialized = false;

export async function initializeDatabase() {
  if (initialized) return;
  runMigrations();
  const db = getDb();

  const existingUsers = await db.select().from(users).limit(1);
  if (existingUsers.length === 0) {
    await db
      .insert(users)
      .values({
        id: uuidv4(),
        username: "admin",
        passwordHash: await hashPassword("admin123"),
        role: "admin",
        isActive: true,
        createdAt: nowIso(),
      })
      .onConflictDoNothing();
  }

  const settings = await db.select().from(appSettings).limit(1);
  if (settings.length === 0) {
    await db.insert(appSettings).values([
      { key: "school_name", value: "BBC School" },
      { key: "school_address", value: "" },
      { key: "receipt_footer", value: "Thank you for your payment." },
      { key: "or_sequence", value: "0" },
    ]);
  }

  const categories = await db.select().from(expenseCategories).limit(1);
  if (categories.length === 0) {
    await db.insert(expenseCategories).values(
      ["Utilities", "Supplies", "Salaries", "Maintenance", "Miscellaneous"].map(
        (name) => ({
          id: uuidv4(),
          name,
          isActive: true,
          createdAt: nowIso(),
        })
      )
    );
  }

  initialized = true;
}
