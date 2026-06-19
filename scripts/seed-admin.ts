import "dotenv/config";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { hashPassword } from "../src/lib/auth/password";
import { getDb } from "../src/lib/db";
import { runMigrations } from "../src/lib/db/migrate";
import { appSettings, expenseCategories, users } from "../src/lib/db/schema";
import { nowIso } from "../src/lib/utils";

async function seed() {
  runMigrations();
  const db = getDb();

  const existingUsers = await db.select().from(users).limit(1);
  if (existingUsers.length === 0) {
    const passwordHash = await hashPassword("admin123");
    await db.insert(users).values({
      id: uuidv4(),
      username: "admin",
      passwordHash,
      role: "admin",
      isActive: true,
      createdAt: nowIso(),
    });
    console.log("Created default admin user: admin / admin123");
  } else {
    console.log("Users already exist, skipping admin seed.");
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
    const defaults = [
      "Utilities",
      "Supplies",
      "Salaries",
      "Maintenance",
      "Miscellaneous",
    ];
    await db.insert(expenseCategories).values(
      defaults.map((name) => ({
        id: uuidv4(),
        name,
        isActive: true,
        createdAt: nowIso(),
      }))
    );
    console.log("Seeded default expense categories.");
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
