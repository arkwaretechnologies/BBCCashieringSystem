import { ExpensesClient } from "@/components/expenses/expenses-client";
import { getExpenseCategoriesAction, getExpensesAction } from "@/lib/actions/expenses";
import { getCurrentUser } from "@/lib/auth/get-session";

export default async function ExpensesPage() {
  const [expenses, categories, user] = await Promise.all([
    getExpensesAction(),
    getExpenseCategoriesAction(),
    getCurrentUser(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">School Expenses</h1>
        <p className="text-muted-foreground">Record and manage school operating expenses.</p>
      </div>
      <ExpensesClient
        expenses={expenses}
        categories={categories}
        isAdmin={user?.role === "admin"}
      />
    </div>
  );
}
