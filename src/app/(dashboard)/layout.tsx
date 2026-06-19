import { requireAuth } from "@/lib/auth/get-session";
import { initializeDatabase } from "@/lib/db/init";
import { AppSidebar } from "@/components/layout/app-sidebar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await initializeDatabase();
  const user = await requireAuth();

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar username={user.username} role={user.role} />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-6">{children}</div>
      </main>
    </div>
  );
}
