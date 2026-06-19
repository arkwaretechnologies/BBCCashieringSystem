"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  createChargeAction,
  createPaymentAction,
  updateStudentAction,
} from "@/lib/actions/students";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

type FeeType = { id: string; name: string; defaultAmount: number };
type Charge = {
  id: string;
  amount: number;
  description: string;
  chargeDate: string;
  feeType: { name: string } | null;
};
type Payment = {
  id: string;
  amount: number;
  orNumber: string;
  paymentMethod: string;
  paidAt: string;
  createdByUser: { username: string };
};

type Props = {
  student: {
    id: string;
    studentNo: string;
    fullName: string;
    gradeLevel: string;
    section: string;
    status: "active" | "inactive";
  };
  charges: Charge[];
  payments: Payment[];
  balance: number;
  feeTypes: FeeType[];
};

export function StudentLedgerClient({
  student,
  charges,
  payments,
  balance,
  feeTypes,
}: Props) {
  const router = useRouter();
  const [chargeOpen, setChargeOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  async function handleCharge(formData: FormData) {
    formData.set("studentId", student.id);
    const result = await createChargeAction(formData);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Charge added");
    setChargeOpen(false);
    router.refresh();
  }

  async function handlePayment(formData: FormData) {
    formData.set("studentId", student.id);
    const result = await createPaymentAction(formData);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success(`Payment recorded (${result.orNumber})`);
    setPaymentOpen(false);
    if (result.paymentId) {
      router.push(`/receipts/${result.paymentId}`);
    } else {
      router.refresh();
    }
  }

  async function handleUpdate(formData: FormData) {
    const result = await updateStudentAction(student.id, formData);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Student updated");
    setEditOpen(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{student.fullName}</h1>
          <p className="text-muted-foreground">
            {student.studentNo} · Grade {student.gradeLevel}
            {student.section ? ` · ${student.section}` : ""}
          </p>
          <Badge className="mt-2" variant={student.status === "active" ? "default" : "secondary"}>
            {student.status}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Edit Student</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Student</DialogTitle>
              </DialogHeader>
              <form action={handleUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentNo">Student No.</Label>
                  <Input id="studentNo" name="studentNo" defaultValue={student.studentNo} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" name="fullName" defaultValue={student.fullName} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gradeLevel">Grade Level</Label>
                    <Input id="gradeLevel" name="gradeLevel" defaultValue={student.gradeLevel} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="section">Section</Label>
                    <Input id="section" name="section" defaultValue={student.section} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <NativeSelect id="edit-status" name="status" defaultValue={student.status}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </NativeSelect>
                </div>
                <Button type="submit" className="w-full">
                  Save Changes
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={chargeOpen} onOpenChange={setChargeOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Add Charge</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Charge</DialogTitle>
              </DialogHeader>
              <form action={handleCharge} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="feeTypeId">Fee Type (optional)</Label>
                  <NativeSelect id="feeTypeId" name="feeTypeId" defaultValue="">
                    <option value="">Custom charge</option>
                    {feeTypes.map((fee) => (
                      <option key={fee.id} value={fee.id}>
                        {fee.name} ({formatCurrency(fee.defaultAmount)})
                      </option>
                    ))}
                  </NativeSelect>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chargeDate">Charge Date</Label>
                  <Input id="chargeDate" name="chargeDate" type="date" defaultValue={todayDateString()} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" />
                </div>
                <Button type="submit" className="w-full">
                  Add Charge
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
            <DialogTrigger asChild>
              <Button>Record Payment</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Payment</DialogTitle>
              </DialogHeader>
              <form action={handlePayment} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" name="amount" type="number" step="0.01" min="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <NativeSelect id="paymentMethod" name="paymentMethod" defaultValue="cash">
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="transfer">Transfer</option>
                  </NativeSelect>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referenceNo">Reference No.</Label>
                  <Input id="referenceNo" name="referenceNo" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paidAt">Payment Date</Label>
                  <Input id="paidAt" name="paidAt" type="datetime-local" defaultValue={new Date().toISOString().slice(0, 16)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" name="notes" />
                </div>
                <Button type="submit" className="w-full">
                  Save Payment
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-3xl font-bold ${balance > 0 ? "text-destructive" : "text-primary"}`}>
            {formatCurrency(balance)}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Charges</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charges.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No charges yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  charges.map((charge) => (
                    <TableRow key={charge.id}>
                      <TableCell>{formatDate(charge.chargeDate)}</TableCell>
                      <TableCell>
                        {charge.feeType?.name ?? (charge.description || "Charge")}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(charge.amount)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>OR No.</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No payments yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.paidAt)}</TableCell>
                      <TableCell>{payment.orNumber}</TableCell>
                      <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/receipts/${payment.id}`}>Receipt</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
