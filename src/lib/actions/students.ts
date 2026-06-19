"use server";

import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { requireAuth, requireAdmin } from "@/lib/auth/get-session";
import { getDb } from "@/lib/db";
import { runMigrations } from "@/lib/db/migrate";
import {
  charges,
  feeTypes,
  paymentAllocations,
  payments,
  students,
} from "@/lib/db/schema";
import { getNextOrNumber } from "@/lib/settings";
import {
  chargeSchema,
  feeTypeSchema,
  paymentSchema,
  studentSchema,
} from "@/lib/validations/schemas";
import { nowIso } from "@/lib/utils";

function ensureDb() {
  runMigrations();
}

export async function createStudentAction(formData: FormData) {
  ensureDb();
  await requireAuth();
  const parsed = studentSchema.safeParse({
    studentNo: formData.get("studentNo"),
    fullName: formData.get("fullName"),
    gradeLevel: formData.get("gradeLevel"),
    section: formData.get("section") ?? "",
    status: formData.get("status") ?? "active",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const db = getDb();
  const existing = await db.query.students.findFirst({
    where: eq(students.studentNo, parsed.data.studentNo),
  });
  if (existing) return { error: "Student number already exists" };

  const now = nowIso();
  await db.insert(students).values({
    id: uuidv4(),
    ...parsed.data,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/students");
  return { success: true };
}

export async function updateStudentAction(id: string, formData: FormData) {
  ensureDb();
  await requireAuth();
  const parsed = studentSchema.safeParse({
    studentNo: formData.get("studentNo"),
    fullName: formData.get("fullName"),
    gradeLevel: formData.get("gradeLevel"),
    section: formData.get("section") ?? "",
    status: formData.get("status") ?? "active",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const db = getDb();
  await db
    .update(students)
    .set({ ...parsed.data, updatedAt: nowIso() })
    .where(eq(students.id, id));

  revalidatePath("/students");
  revalidatePath(`/students/${id}`);
  return { success: true };
}

export async function createFeeTypeAction(formData: FormData) {
  ensureDb();
  await requireAdmin();
  const parsed = feeTypeSchema.safeParse({
    name: formData.get("name"),
    defaultAmount: formData.get("defaultAmount"),
    description: formData.get("description") ?? "",
    isActive: formData.get("isActive") === "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const db = getDb();
  await db.insert(feeTypes).values({
    id: uuidv4(),
    ...parsed.data,
    createdAt: nowIso(),
  });

  revalidatePath("/fees");
  return { success: true };
}

export async function updateFeeTypeAction(id: string, formData: FormData) {
  ensureDb();
  await requireAdmin();
  const parsed = feeTypeSchema.safeParse({
    name: formData.get("name"),
    defaultAmount: formData.get("defaultAmount"),
    description: formData.get("description") ?? "",
    isActive: formData.get("isActive") === "true",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const db = getDb();
  await db.update(feeTypes).set(parsed.data).where(eq(feeTypes.id, id));
  revalidatePath("/fees");
  return { success: true };
}

export async function createChargeAction(formData: FormData) {
  ensureDb();
  const user = await requireAuth();
  const feeTypeId = formData.get("feeTypeId");
  const parsed = chargeSchema.safeParse({
    studentId: formData.get("studentId"),
    feeTypeId: feeTypeId && String(feeTypeId) !== "" ? feeTypeId : undefined,
    amount: formData.get("amount"),
    description: formData.get("description") ?? "",
    chargeDate: formData.get("chargeDate"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const db = getDb();
  await db.insert(charges).values({
    id: uuidv4(),
    studentId: parsed.data.studentId,
    feeTypeId: parsed.data.feeTypeId ?? null,
    amount: parsed.data.amount,
    description: parsed.data.description,
    chargeDate: parsed.data.chargeDate,
    createdBy: user.id,
    createdAt: nowIso(),
  });

  revalidatePath(`/students/${parsed.data.studentId}`);
  revalidatePath("/students");
  return { success: true };
}

export async function createPaymentAction(formData: FormData) {
  ensureDb();
  const user = await requireAuth();
  const parsed = paymentSchema.safeParse({
    studentId: formData.get("studentId"),
    amount: formData.get("amount"),
    paymentMethod: formData.get("paymentMethod"),
    referenceNo: formData.get("referenceNo") ?? "",
    notes: formData.get("notes") ?? "",
    paidAt: formData.get("paidAt"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const db = getDb();
  const orNumber = await getNextOrNumber();
  const paymentId = uuidv4();
  const now = nowIso();

  await db.insert(payments).values({
    id: paymentId,
    studentId: parsed.data.studentId,
    amount: parsed.data.amount,
    paymentMethod: parsed.data.paymentMethod,
    orNumber,
    referenceNo: parsed.data.referenceNo,
    notes: parsed.data.notes,
    createdBy: user.id,
    paidAt: new Date(parsed.data.paidAt).toISOString(),
    createdAt: now,
  });

  revalidatePath("/payments");
  revalidatePath(`/students/${parsed.data.studentId}`);
  revalidatePath("/");
  return { success: true, paymentId, orNumber };
}

export async function getPaymentsAction(filters?: {
  from?: string;
  to?: string;
  studentId?: string;
}) {
  ensureDb();
  await requireAuth();
  const db = getDb();
  const conditions = [];

  if (filters?.from) {
    conditions.push(gte(payments.paidAt, new Date(filters.from).toISOString()));
  }
  if (filters?.to) {
    const end = new Date(filters.to);
    end.setHours(23, 59, 59, 999);
    conditions.push(lte(payments.paidAt, end.toISOString()));
  }
  if (filters?.studentId) {
    conditions.push(eq(payments.studentId, filters.studentId));
  }

  return db.query.payments.findMany({
    where: conditions.length ? and(...conditions) : undefined,
    orderBy: [desc(payments.paidAt)],
    with: {
      student: true,
      createdByUser: true,
    },
  });
}

export async function getStudentLedgerAction(studentId: string) {
  ensureDb();
  await requireAuth();
  const db = getDb();

  const student = await db.query.students.findFirst({
    where: eq(students.id, studentId),
  });
  if (!student) return null;

  const studentCharges = await db.query.charges.findMany({
    where: eq(charges.studentId, studentId),
    orderBy: [desc(charges.chargeDate)],
    with: { feeType: true, createdByUser: true },
  });

  const studentPayments = await db.query.payments.findMany({
    where: eq(payments.studentId, studentId),
    orderBy: [desc(payments.paidAt)],
    with: { createdByUser: true },
  });

  const [chargeTotal] = await db
    .select({ total: sql<number>`coalesce(sum(${charges.amount}), 0)` })
    .from(charges)
    .where(eq(charges.studentId, studentId));

  const [paymentTotal] = await db
    .select({ total: sql<number>`coalesce(sum(${payments.amount}), 0)` })
    .from(payments)
    .where(eq(payments.studentId, studentId));

  return {
    student,
    charges: studentCharges,
    payments: studentPayments,
    balance: (chargeTotal?.total ?? 0) - (paymentTotal?.total ?? 0),
  };
}
