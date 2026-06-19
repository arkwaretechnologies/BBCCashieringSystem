import { StudentsClient } from "@/components/students/students-client";
import { getStudentsWithBalances } from "@/lib/reports/queries";

export default async function StudentsPage() {
  const students = await getStudentsWithBalances();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Students</h1>
        <p className="text-muted-foreground">Manage student records and view ledger balances.</p>
      </div>
      <StudentsClient students={students} />
    </div>
  );
}
