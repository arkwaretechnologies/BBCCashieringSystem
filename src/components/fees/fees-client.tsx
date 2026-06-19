"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createFeeTypeAction, updateFeeTypeAction } from "@/lib/actions/students";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { formatCurrency } from "@/lib/utils";

type FeeTypeRow = {
  id: string;
  name: string;
  defaultAmount: number;
  description: string;
  isActive: boolean;
};

export function FeesClient({ feeTypes }: { feeTypes: FeeTypeRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const editing = feeTypes.find((f) => f.id === editId);

  async function handleCreate(formData: FormData) {
    formData.set("isActive", formData.get("isActive") === "true" ? "true" : "false");
    const result = await createFeeTypeAction(formData);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Fee type created");
    setOpen(false);
    router.refresh();
  }

  async function handleUpdate(formData: FormData) {
    if (!editId) return;
    formData.set("isActive", formData.get("isActive") === "true" ? "true" : "false");
    const result = await updateFeeTypeAction(editId, formData);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Fee type updated");
    setEditId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Fee Type</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Fee Type</DialogTitle>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultAmount">Default Amount</Label>
                <Input id="defaultAmount" name="defaultAmount" type="number" step="0.01" min="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isActive">Status</Label>
                <NativeSelect id="isActive" name="isActive" defaultValue="true">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </NativeSelect>
              </div>
              <Button type="submit" className="w-full">
                Save
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Default Amount</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {feeTypes.map((fee) => (
            <TableRow key={fee.id}>
              <TableCell>{fee.name}</TableCell>
              <TableCell>{formatCurrency(fee.defaultAmount)}</TableCell>
              <TableCell>{fee.description || "—"}</TableCell>
              <TableCell>
                <Badge variant={fee.isActive ? "default" : "secondary"}>
                  {fee.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" onClick={() => setEditId(fee.id)}>
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!editId} onOpenChange={(value) => !value && setEditId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Fee Type</DialogTitle>
          </DialogHeader>
          {editing && (
            <form action={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input id="edit-name" name="name" defaultValue={editing.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-defaultAmount">Default Amount</Label>
                <Input
                  id="edit-defaultAmount"
                  name="defaultAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={editing.defaultAmount}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea id="edit-description" name="description" defaultValue={editing.description} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-isActive">Status</Label>
                <NativeSelect
                  id="edit-isActive"
                  name="isActive"
                  defaultValue={editing.isActive ? "true" : "false"}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </NativeSelect>
              </div>
              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
