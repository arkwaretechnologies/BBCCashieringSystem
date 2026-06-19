import { UsersClient } from "@/components/users/users-client";
import { getUsersAction } from "@/lib/actions/users";

export default async function UsersPage() {
  const users = await getUsersAction();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage admin and cashier accounts.</p>
      </div>
      <UsersClient users={users} />
    </div>
  );
}
