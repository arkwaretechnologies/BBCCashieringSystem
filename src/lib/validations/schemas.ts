import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.enum(["admin", "cashier"]),
  isActive: z.boolean(),
});

export const studentSchema = z.object({
  studentNo: z.string().min(1, "Student number is required"),
  fullName: z.string().min(1, "Full name is required"),
  gradeLevel: z.string().min(1, "Grade level is required"),
  section: z.string(),
  status: z.enum(["active", "inactive"]),
});

export const feeTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  defaultAmount: z.coerce.number().min(0),
  description: z.string(),
  isActive: z.boolean(),
});

export const chargeSchema = z.object({
  studentId: z.string().min(1),
  feeTypeId: z.string().optional(),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  description: z.string(),
  chargeDate: z.string().min(1),
});

export const paymentSchema = z.object({
  studentId: z.string().min(1),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  paymentMethod: z.enum(["cash", "check", "transfer"]),
  referenceNo: z.string(),
  notes: z.string(),
  paidAt: z.string().min(1),
});

export const expenseCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  isActive: z.boolean(),
});

export const expenseSchema = z.object({
  categoryId: z.string().min(1),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  description: z.string(),
  expenseDate: z.string().min(1),
});

export const schoolSettingsSchema = z.object({
  schoolName: z.string().min(1),
  schoolAddress: z.string(),
  receiptFooter: z.string(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type StudentInput = z.infer<typeof studentSchema>;
export type FeeTypeInput = z.infer<typeof feeTypeSchema>;
export type ChargeInput = z.infer<typeof chargeSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type ExpenseCategoryInput = z.infer<typeof expenseCategorySchema>;
export type UserInput = z.infer<typeof userSchema>;
export type SchoolSettingsInput = z.infer<typeof schoolSettingsSchema>;
