"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { formatCurrency, formatDateTime } from "@/lib/utils";

type PaymentRow = {
  id: string;
  orNumber: string;
  amount: number;
  paymentMethod: string;
  paidAt: string;
  student: { fullName: string; studentNo: string };
  createdByUser: { username: string };
};

export function PaymentsClient({ payments }: { payments: PaymentRow[] }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return payments.filter((payment) => {
      const paidDate = payment.paidAt.slice(0, 10);
      if (from && paidDate < from) return false;
      if (to && paidDate > to) return false;
      if (
        search &&
        !payment.student.fullName.toLowerCase().includes(search.toLowerCase()) &&
        !payment.orNumber.toLowerCase().includes(search.toLowerCase()) &&
        !payment.student.studentNo.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [payments, from, to, search]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Student, OR no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="from">From</Label>
          <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="to">To</Label>
          <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>OR No.</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Cashier</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No payments found.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{formatDateTime(payment.paidAt)}</TableCell>
                <TableCell>{payment.orNumber}</TableCell>
                <TableCell>
                  {payment.student.fullName}
                  <span className="block text-xs text-muted-foreground">
                    {payment.student.studentNo}
                  </span>
                </TableCell>
                <TableCell className="capitalize">{payment.paymentMethod}</TableCell>
                <TableCell>{payment.createdByUser.username}</TableCell>
                <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/receipts/${payment.id}`}>Receipt</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
