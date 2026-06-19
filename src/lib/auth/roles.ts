import type { UserRole } from "@/lib/db/schema";

export const ADMIN_ONLY_PATHS = ["/users", "/settings"];

export function isAdminOnlyPath(pathname: string) {
  return ADMIN_ONLY_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function canAccessPath(role: UserRole, pathname: string) {
  if (isAdminOnlyPath(pathname) && role !== "admin") {
    return false;
  }
  return true;
}

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", adminOnly: false },
  { href: "/students", label: "Students", adminOnly: false },
  { href: "/payments", label: "Payments", adminOnly: false },
  { href: "/fees", label: "Fee Types", adminOnly: true },
  { href: "/expenses", label: "Expenses", adminOnly: false },
  { href: "/reports", label: "Reports", adminOnly: false },
  { href: "/users", label: "Users", adminOnly: true },
  { href: "/settings", label: "Settings", adminOnly: true },
] as const;
