"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  createExpenseAction,
  createExpenseCategoryAction,
  deleteExpenseAction,
  updateExpenseAction,
} from "@/lib/actions/expenses";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency, formatDate, todayDateString } from "@/lib/utils";

type Category = { id: string; name: string; isActive: boolean };
type ExpenseRow = {
  id: string;
  categoryId: string;
  amount: number;
  description: string;
  expenseDate: string;
  category: { name: string };
  createdByUser: { username: string };
};

export function ExpensesClient({
  expenses,
  categories,
  isAdmin,
}: {
  expenses: ExpenseRow[];
  categories: Category[];
  isAdmin: boolean;
}) {
  const router = useRouter();
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const editing = expenses.find((e) => e.id === editId);

  async function handleExpense(formData: FormData) {
    const result = await createExpenseAction(formData);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Expense recorded");
    setExpenseOpen(false);
    router.refresh();
  }

  async function handleUpdate(formData: FormData) {
    if (!editId) return;
    const result = await updateExpenseAction(editId, formData);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Expense updated");
    setEditId(null);
    router.refresh();
  }

  async function handleCategory(formData: FormData) {
    formData.set("isActive", "true");
    const result = await createExpenseCategoryAction(formData);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Category created");
    setCategoryOpen(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    await deleteExpenseAction(id);
    toast.success("Expense deleted");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-end gap-2">
        {isAdmin && (
          <Dialog open={categoryOpen} onOpenChange={setCategoryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Add Category</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Expense Category</DialogTitle>
              </DialogHeader>
              <form action={handleCategory} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input id="categoryName" name="name" required />
                </div>
                <Button type="submit" className="w-full">
                  Save Category
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
        <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
          <DialogTrigger asChild>
            <Button>Add Expense</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Expense</DialogTitle>
            </DialogHeader>
            <form action={handleExpense} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <NativeSelect id="categoryId" name="categoryId" required defaultValue="">
                  <option value="" disabled>
                    Select category
                  </option>
                  {categories.filter((c) => c.isActive).map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expenseDate">Date</Label>
                <Input id="expenseDate" name="expenseDate" type="date" defaultValue={todayDateString()} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" />
              </div>
              <Button type="submit" className="w-full">
                Save Expense
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Recorded By</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No expenses recorded.
              </TableCell>
            </TableRow>
          ) : (
            expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{formatDate(expense.expenseDate)}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{expense.category.name}</Badge>
                </TableCell>
                <TableCell>{expense.description || "—"}</TableCell>
                <TableCell>{expense.createdByUser.username}</TableCell>
                <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditId(expense.id)}>
                      Edit
                    </Button>
                    {isAdmin && (
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(expense.id)}>
                        Delete
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={!!editId} onOpenChange={(value) => !value && setEditId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          {editing && (
            <form action={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-categoryId">Category</Label>
                <NativeSelect
                  id="edit-categoryId"
                  name="categoryId"
                  defaultValue={editing.categoryId}
                  required
                >
                  {categories.filter((c) => c.isActive).map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Amount</Label>
                <Input id="edit-amount" name="amount" type="number" step="0.01" min="0.01" defaultValue={editing.amount} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-expenseDate">Date</Label>
                <Input id="edit-expenseDate" name="expenseDate" type="date" defaultValue={editing.expenseDate} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea id="edit-description" name="description" defaultValue={editing.description} />
              </div>
              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
