import { ReportsClient } from "@/components/reports/reports-client";
import { getMonthlyExpenseReportAction } from "@/lib/actions/expenses";
import { getCashFlowSummary } from "@/lib/reports/queries";
import { monthKey } from "@/lib/utils";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const selectedMonth = params.month ?? monthKey();

  const [expenseReport, cashFlow] = await Promise.all([
    getMonthlyExpenseReportAction(selectedMonth),
    getCashFlowSummary(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Monthly expense breakdown and cash flow summary.</p>
      </div>
      <ReportsClient
        expenseReport={expenseReport}
        cashFlow={cashFlow}
        initialMonth={selectedMonth}
      />
    </div>
  );
}
