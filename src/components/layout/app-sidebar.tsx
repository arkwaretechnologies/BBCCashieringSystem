"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CreditCard,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth";
import type { UserRole } from "@/lib/db/schema";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/students", label: "Students", icon: GraduationCap, adminOnly: false },
  { href: "/payments", label: "Payments", icon: Receipt, adminOnly: false },
  { href: "/fees", label: "Fee Types", icon: CreditCard, adminOnly: true },
  { href: "/expenses", label: "Expenses", icon: Wallet, adminOnly: false },
  { href: "/reports", label: "Reports", icon: FileText, adminOnly: false },
  { href: "/users", label: "Users", icon: Users, adminOnly: true },
  { href: "/settings", label: "Settings", icon: Settings, adminOnly: true },
];

export function AppSidebar({
  username,
  role,
}: {
  username: string;
  role: UserRole;
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logoutAction();
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="border-b p-6">
        <h1 className="text-lg font-bold text-primary">BBC Cashiering</h1>
        <p className="text-xs text-muted-foreground">School Finance System</p>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {NAV.filter((item) => role === "admin" || !item.adminOnly).map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <div className="mb-3 text-sm">
          <p className="font-medium">{username}</p>
          <p className="text-xs capitalize text-muted-foreground">{role}</p>
        </div>
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
