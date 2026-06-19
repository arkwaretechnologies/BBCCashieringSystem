"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createUserAction, updateUserAction } from "@/lib/actions/users";
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

type UserRow = {
  id: string;
  username: string;
  role: "admin" | "cashier";
  isActive: boolean;
};

export function UsersClient({ users }: { users: UserRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const editing = users.find((u) => u.id === editId);

  async function handleCreate(formData: FormData) {
    formData.set("isActive", formData.get("isActive") === "true" ? "true" : "false");
    const result = await createUserAction(formData);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("User created");
    setOpen(false);
    router.refresh();
  }

  async function handleUpdate(formData: FormData) {
    if (!editId) return;
    formData.set("isActive", formData.get("isActive") === "true" ? "true" : "false");
    const result = await updateUserAction(editId, formData);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("User updated");
    setEditId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add User</DialogTitle>
            </DialogHeader>
            <form action={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <NativeSelect id="role" name="role" defaultValue="cashier">
                  <option value="admin">Admin</option>
                  <option value="cashier">Cashier</option>
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="isActive">Status</Label>
                <NativeSelect id="isActive" name="isActive" defaultValue="true">
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </NativeSelect>
              </div>
              <Button type="submit" className="w-full">
                Save User
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.username}</TableCell>
              <TableCell className="capitalize">{user.role}</TableCell>
              <TableCell>
                <Badge variant={user.isActive ? "default" : "secondary"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" onClick={() => setEditId(user.id)}>
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
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editing && (
            <form action={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-username">Username</Label>
                <Input id="edit-username" name="username" defaultValue={editing.username} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-password">New Password (optional)</Label>
                <Input id="edit-password" name="password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <NativeSelect id="edit-role" name="role" defaultValue={editing.role}>
                  <option value="admin">Admin</option>
                  <option value="cashier">Cashier</option>
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-user-isActive">Status</Label>
                <NativeSelect
                  id="edit-user-isActive"
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
