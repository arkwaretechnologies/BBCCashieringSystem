import { getDb } from "@/lib/db";
import { appSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getSetting(key: string, fallback = "") {
  const db = getDb();
  const row = await db.query.appSettings.findFirst({
    where: eq(appSettings.key, key),
  });
  return row?.value ?? fallback;
}

export async function setSetting(key: string, value: string) {
  const db = getDb();
  await db
    .insert(appSettings)
    .values({ key, value })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value },
    });
}

export async function getSchoolSettings() {
  const [schoolName, schoolAddress, receiptFooter] = await Promise.all([
    getSetting("school_name", "BBC School"),
    getSetting("school_address", ""),
    getSetting("receipt_footer", "Thank you for your payment."),
  ]);
  return { schoolName, schoolAddress, receiptFooter };
}

export async function getNextOrNumber() {
  const db = getDb();
  const current = await getSetting("or_sequence", "0");
  const next = Number.parseInt(current, 10) + 1;
  const orNumber = `OR-${String(next).padStart(6, "0")}`;

  await db
    .insert(appSettings)
    .values({ key: "or_sequence", value: String(next) })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value: String(next) },
    });

  return orNumber;
}
