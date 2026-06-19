"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { exportCashFlowToExcel, exportExpenseReportToExcel } from "@/lib/exports/excel";
import { formatCurrency, monthKey } from "@/lib/utils";

type ExpenseReportRow = { categoryName: string; total: number };
type CashFlowRow = {
  month: string;
  collections: number;
  expenses: number;
  net: number;
};

export function ReportsClient({
  expenseReport,
  cashFlow,
  initialMonth,
}: {
  expenseReport: ExpenseReportRow[];
  cashFlow: CashFlowRow[];
  initialMonth: string;
}) {
  const [month, setMonth] = useState(initialMonth);

  const expenseTotal = useMemo(
    () => expenseReport.reduce((sum, row) => sum + row.total, 0),
    [expenseReport]
  );

  async function downloadExpenseReport() {
    try {
      const blob = await exportExpenseReportToExcel(expenseReport, month);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `expense-report-${month}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to export expense report");
    }
  }

  async function downloadCashFlow() {
    try {
      const blob = await exportCashFlowToExcel(cashFlow);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "cash-flow-summary.xlsx";
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to export cash flow");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Label htmlFor="month">Report Month</Label>
          <form method="get">
            <div className="flex gap-2">
              <Input
                id="month"
                name="month"
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
              <Button type="submit">Apply</Button>
            </div>
          </form>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadExpenseReport}>
            Export Expenses
          </Button>
          <Button variant="outline" onClick={downloadCashFlow}>
            Export Cash Flow
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Expense Report — {month}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenseReport.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    No expenses for this month.
                  </TableCell>
                </TableRow>
              ) : (
                expenseReport.map((row) => (
                  <TableRow key={row.categoryName}>
                    <TableCell>{row.categoryName}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.total)}</TableCell>
                  </TableRow>
                ))
              )}
              {expenseReport.length > 0 && (
                <TableRow>
                  <TableCell className="font-semibold">Total</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(expenseTotal)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Collections</TableHead>
                <TableHead className="text-right">Expenses</TableHead>
                <TableHead className="text-right">Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashFlow.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No cash flow data yet.
                  </TableCell>
                </TableRow>
              ) : (
                cashFlow.map((row) => (
                  <TableRow key={row.month}>
                    <TableCell>{row.month}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.collections)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.expenses)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(row.net)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
