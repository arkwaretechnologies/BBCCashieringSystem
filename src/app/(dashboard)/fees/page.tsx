import { FeesClient } from "@/components/fees/fees-client";
import { requireAdmin } from "@/lib/auth/get-session";
import { getDb } from "@/lib/db";

export default async function FeesPage() {
  await requireAdmin();
  const db = getDb();
  const feeTypes = await db.query.feeTypes.findMany({
    orderBy: (f, { asc }) => [asc(f.name)],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fee Types</h1>
        <p className="text-muted-foreground">Manage charge and fee categories for student billing.</p>
      </div>
      <FeesClient feeTypes={feeTypes} />
    </div>
  );
}
