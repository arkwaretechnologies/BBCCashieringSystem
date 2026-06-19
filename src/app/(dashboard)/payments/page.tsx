import { PaymentsClient } from "@/components/payments/payments-client";
import { getPaymentsAction } from "@/lib/actions/students";

export default async function PaymentsPage() {
  const payments = await getPaymentsAction();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payment History</h1>
        <p className="text-muted-foreground">View and print receipts for recorded payments.</p>
      </div>
      <PaymentsClient payments={payments} />
    </div>
  );
}
