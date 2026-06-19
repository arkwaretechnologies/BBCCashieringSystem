import { relations } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "cashier"] }).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
});

export const students = sqliteTable("students", {
  id: text("id").primaryKey(),
  studentNo: text("student_no").notNull().unique(),
  fullName: text("full_name").notNull(),
  gradeLevel: text("grade_level").notNull(),
  section: text("section").notNull().default(""),
  status: text("status", { enum: ["active", "inactive"] })
    .notNull()
    .default("active"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const feeTypes = sqliteTable("fee_types", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  defaultAmount: real("default_amount").notNull().default(0),
  description: text("description").notNull().default(""),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
});

export const charges = sqliteTable("charges", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id),
  feeTypeId: text("fee_type_id").references(() => feeTypes.id),
  amount: real("amount").notNull(),
  description: text("description").notNull().default(""),
  chargeDate: text("charge_date").notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: text("created_at").notNull(),
});

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  studentId: text("student_id")
    .notNull()
    .references(() => students.id),
  amount: real("amount").notNull(),
  paymentMethod: text("payment_method", {
    enum: ["cash", "check", "transfer"],
  }).notNull(),
  orNumber: text("or_number").notNull().unique(),
  referenceNo: text("reference_no").notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  paidAt: text("paid_at").notNull(),
  createdAt: text("created_at").notNull(),
});

export const paymentAllocations = sqliteTable("payment_allocations", {
  id: text("id").primaryKey(),
  paymentId: text("payment_id")
    .notNull()
    .references(() => payments.id, { onDelete: "cascade" }),
  chargeId: text("charge_id")
    .notNull()
    .references(() => charges.id),
  amount: real("amount").notNull(),
});

export const expenseCategories = sqliteTable("expense_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
});

export const expenses = sqliteTable("expenses", {
  id: text("id").primaryKey(),
  categoryId: text("category_id")
    .notNull()
    .references(() => expenseCategories.id),
  amount: real("amount").notNull(),
  description: text("description").notNull().default(""),
  expenseDate: text("expense_date").notNull(),
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const appSettings = sqliteTable("app_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  charges: many(charges),
  payments: many(payments),
  expenses: many(expenses),
}));

export const studentsRelations = relations(students, ({ many }) => ({
  charges: many(charges),
  payments: many(payments),
}));

export const feeTypesRelations = relations(feeTypes, ({ many }) => ({
  charges: many(charges),
}));

export const chargesRelations = relations(charges, ({ one, many }) => ({
  student: one(students, {
    fields: [charges.studentId],
    references: [students.id],
  }),
  feeType: one(feeTypes, {
    fields: [charges.feeTypeId],
    references: [feeTypes.id],
  }),
  createdByUser: one(users, {
    fields: [charges.createdBy],
    references: [users.id],
  }),
  allocations: many(paymentAllocations),
}));

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  student: one(students, {
    fields: [payments.studentId],
    references: [students.id],
  }),
  createdByUser: one(users, {
    fields: [payments.createdBy],
    references: [users.id],
  }),
  allocations: many(paymentAllocations),
}));

export const paymentAllocationsRelations = relations(
  paymentAllocations,
  ({ one }) => ({
    payment: one(payments, {
      fields: [paymentAllocations.paymentId],
      references: [payments.id],
    }),
    charge: one(charges, {
      fields: [paymentAllocations.chargeId],
      references: [charges.id],
    }),
  })
);

export const expenseCategoriesRelations = relations(
  expenseCategories,
  ({ many }) => ({
    expenses: many(expenses),
  })
);

export const expensesRelations = relations(expenses, ({ one }) => ({
  category: one(expenseCategories, {
    fields: [expenses.categoryId],
    references: [expenseCategories.id],
  }),
  createdByUser: one(users, {
    fields: [expenses.createdBy],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type Student = typeof students.$inferSelect;
export type FeeType = typeof feeTypes.$inferSelect;
export type Charge = typeof charges.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type UserRole = "admin" | "cashier";
