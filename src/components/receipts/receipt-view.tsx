"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime } from "@/lib/utils";

type ReceiptProps = {
  schoolName: string;
  schoolAddress: string;
  receiptFooter: string;
  payment: {
    orNumber: string;
    amount: number;
    paymentMethod: string;
    referenceNo: string;
    notes: string;
    paidAt: string;
    student: {
      fullName: string;
      studentNo: string;
      gradeLevel: string;
      section: string;
    };
    createdByUser: {
      username: string;
    };
  };
};

export function ReceiptView({
  schoolName,
  schoolAddress,
  receiptFooter,
  payment,
}: ReceiptProps) {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="no-print flex gap-2">
        <Button onClick={() => window.print()}>Print Receipt</Button>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      <div className="print-area mx-auto max-w-[80mm] rounded-lg border bg-white p-4 text-sm text-black shadow-sm">
        <div className="text-center">
          <h1 className="text-base font-bold">{schoolName}</h1>
          {schoolAddress && <p className="text-xs">{schoolAddress}</p>}
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide">Official Receipt</p>
        </div>

        <div className="my-4 space-y-1 border-y border-dashed py-3 text-xs">
          <div className="flex justify-between">
            <span>OR No.</span>
            <span className="font-medium">{payment.orNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Date</span>
            <span>{formatDateTime(payment.paidAt)}</span>
          </div>
          <div className="flex justify-between">
            <span>Cashier</span>
            <span>{payment.createdByUser.username}</span>
          </div>
        </div>

        <div className="space-y-1 text-xs">
          <p>
            <span className="font-medium">Student:</span> {payment.student.fullName}
          </p>
          <p>
            <span className="font-medium">Student No.:</span> {payment.student.studentNo}
          </p>
          <p>
            <span className="font-medium">Grade:</span> {payment.student.gradeLevel}
            {payment.student.section ? ` - ${payment.student.section}` : ""}
          </p>
          <p>
            <span className="font-medium">Method:</span>{" "}
            <span className="capitalize">{payment.paymentMethod}</span>
          </p>
          {payment.referenceNo && (
            <p>
              <span className="font-medium">Reference:</span> {payment.referenceNo}
            </p>
          )}
          {payment.notes && (
            <p>
              <span className="font-medium">Notes:</span> {payment.notes}
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-dashed pt-3">
          <span className="text-sm font-semibold">Amount Paid</span>
          <span className="text-lg font-bold">{formatCurrency(payment.amount)}</span>
        </div>

        <p className="mt-4 text-center text-xs">{receiptFooter}</p>
      </div>
    </div>
  );
}
