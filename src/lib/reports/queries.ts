import "server-only";

import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import {
  charges,
  expenses,
  payments,
  students,
} from "@/lib/db/schema";
import { todayDateString } from "@/lib/utils";

export async function getStudentBalance(studentId: string) {
  const db = getDb();
  const [chargeTotal] = await db
    .select({ total: sql<number>`coalesce(sum(${charges.amount}), 0)` })
    .from(charges)
    .where(sql`${charges.studentId} = ${studentId}`);

  const [paymentTotal] = await db
    .select({ total: sql<number>`coalesce(sum(${payments.amount}), 0)` })
    .from(payments)
    .where(sql`${payments.studentId} = ${studentId}`);

  return (chargeTotal?.total ?? 0) - (paymentTotal?.total ?? 0);
}

export async function getStudentsWithBalances(search = "") {
  const db = getDb();
  const allStudents = await db.query.students.findMany({
    orderBy: (s, { asc }) => [asc(s.fullName)],
  });

  const filtered = search
    ? allStudents.filter(
        (s) =>
          s.fullName.toLowerCase().includes(search.toLowerCase()) ||
          s.studentNo.toLowerCase().includes(search.toLowerCase()) ||
          s.gradeLevel.toLowerCase().includes(search.toLowerCase())
      )
    : allStudents;

  const withBalances = await Promise.all(
    filtered.map(async (student) => ({
      ...student,
      balance: await getStudentBalance(student.id),
    }))
  );

  return withBalances;
}

export async function getDashboardStats() {
  const db = getDb();
  const today = todayDateString();
  const monthPrefix = today.slice(0, 7);

  const [todayCollections] = await db
    .select({ total: sql<number>`coalesce(sum(${payments.amount}), 0)` })
    .from(payments)
    .where(sql`date(${payments.paidAt}) = ${today}`);

  const [monthCollections] = await db
    .select({ total: sql<number>`coalesce(sum(${payments.amount}), 0)` })
    .from(payments)
    .where(sql`strftime('%Y-%m', ${payments.paidAt}) = ${monthPrefix}`);

  const [monthExpenses] = await db
    .select({ total: sql<number>`coalesce(sum(${expenses.amount}), 0)` })
    .from(expenses)
    .where(sql`strftime('%Y-%m', ${expenses.expenseDate}) = ${monthPrefix}`);

  const studentsWithBalances = await getStudentsWithBalances();
  const outstandingCount = studentsWithBalances.filter(
    (s) => s.balance > 0 && s.status === "active"
  ).length;

  const recentPayments = await db.query.payments.findMany({
    limit: 8,
    orderBy: (p, { desc }) => [desc(p.paidAt)],
    with: {
      student: true,
      createdByUser: true,
    },
  });

  return {
    todayCollections: todayCollections?.total ?? 0,
    monthCollections: monthCollections?.total ?? 0,
    monthExpenses: monthExpenses?.total ?? 0,
    netCashFlow: (monthCollections?.total ?? 0) - (monthExpenses?.total ?? 0),
    outstandingCount,
    recentPayments,
    activeStudents: await db
      .select({ count: sql<number>`count(*)` })
      .from(students)
      .where(sql`${students.status} = 'active'`),
  };
}

export async function getMonthlyExpenseReport(yearMonth: string) {
  const db = getDb();
  return db
    .select({
      categoryId: expenses.categoryId,
      categoryName: sql<string>`expense_categories.name`,
      total: sql<number>`coalesce(sum(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .innerJoin(
      sql`expense_categories`,
      sql`${expenses.categoryId} = expense_categories.id`
    )
    .where(sql`strftime('%Y-%m', ${expenses.expenseDate}) = ${yearMonth}`)
    .groupBy(expenses.categoryId, sql`expense_categories.name`);
}

export async function getCashFlowSummary(months = 6) {
  const db = getDb();
  const collections = await db
    .select({
      month: sql<string>`strftime('%Y-%m', ${payments.paidAt})`,
      total: sql<number>`coalesce(sum(${payments.amount}), 0)`,
    })
    .from(payments)
    .groupBy(sql`strftime('%Y-%m', ${payments.paidAt})`)
    .orderBy(sql`strftime('%Y-%m', ${payments.paidAt}) desc`)
    .limit(months);

  const expenseTotals = await db
    .select({
      month: sql<string>`strftime('%Y-%m', ${expenses.expenseDate})`,
      total: sql<number>`coalesce(sum(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .groupBy(sql`strftime('%Y-%m', ${expenses.expenseDate})`)
    .orderBy(sql`strftime('%Y-%m', ${expenses.expenseDate}) desc`)
    .limit(months);

  const expenseMap = new Map(expenseTotals.map((e) => [e.month, e.total]));

  return collections.map((row) => ({
    month: row.month,
    collections: row.total,
    expenses: expenseMap.get(row.month) ?? 0,
    net: row.total - (expenseMap.get(row.month) ?? 0),
  }));
}
