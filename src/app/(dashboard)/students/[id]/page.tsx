import { notFound } from "next/navigation";
import { StudentLedgerClient } from "@/components/students/student-ledger-client";
import { getStudentLedgerAction } from "@/lib/actions/students";
import { getDb } from "@/lib/db";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ledger = await getStudentLedgerAction(id);
  if (!ledger) notFound();

  const db = getDb();
  const allFeeTypes = await db.query.feeTypes.findMany({
    where: (f, { eq }) => eq(f.isActive, true),
    orderBy: (f, { asc }) => [asc(f.name)],
  });

  return (
    <StudentLedgerClient
      student={ledger.student}
      charges={ledger.charges}
      payments={ledger.payments}
      balance={ledger.balance}
      feeTypes={allFeeTypes}
    />
  );
}
