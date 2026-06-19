import { notFound } from "next/navigation";
import { ReceiptView } from "@/components/receipts/receipt-view";
import { requireAuth } from "@/lib/auth/get-session";
import { getDb } from "@/lib/db";
import { getSchoolSettings } from "@/lib/settings";
import { eq } from "drizzle-orm";
import { payments } from "@/lib/db/schema";

export default async function ReceiptPage({
  params,
}: {
  params: Promise<{ paymentId: string }>;
}) {
  await requireAuth();
  const { paymentId } = await params;
  const db = getDb();

  const payment = await db.query.payments.findFirst({
    where: eq(payments.id, paymentId),
    with: {
      student: true,
      createdByUser: true,
    },
  });

  if (!payment) notFound();

  const settings = await getSchoolSettings();

  return (
    <ReceiptView
      schoolName={settings.schoolName}
      schoolAddress={settings.schoolAddress}
      receiptFooter={settings.receiptFooter}
      payment={payment}
    />
  );
}
