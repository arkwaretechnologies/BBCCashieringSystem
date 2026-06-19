import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "node:path";
import { getDb } from "@/lib/db";

let migrated = false;

export function runMigrations() {
  if (migrated) return;
  const db = getDb();
  migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle/migrations") });
  migrated = true;
}
