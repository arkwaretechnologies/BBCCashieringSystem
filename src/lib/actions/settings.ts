"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/get-session";
import { runMigrations } from "@/lib/db/migrate";
import { getSchoolSettings, setSetting } from "@/lib/settings";
import { schoolSettingsSchema } from "@/lib/validations/schemas";

function ensureDb() {
  runMigrations();
}

export async function updateSchoolSettingsAction(formData: FormData) {
  ensureDb();
  await requireAdmin();
  const parsed = schoolSettingsSchema.safeParse({
    schoolName: formData.get("schoolName"),
    schoolAddress: formData.get("schoolAddress") ?? "",
    receiptFooter: formData.get("receiptFooter") ?? "",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await setSetting("school_name", parsed.data.schoolName);
  await setSetting("school_address", parsed.data.schoolAddress);
  await setSetting("receipt_footer", parsed.data.receiptFooter);

  revalidatePath("/settings");
  revalidatePath("/receipts");
  return { success: true };
}

export async function getSchoolSettingsAction() {
  ensureDb();
  await requireAdmin();
  return getSchoolSettings();
}
