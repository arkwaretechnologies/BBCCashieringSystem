import type { SessionOptions } from "iron-session";
import type { UserRole } from "@/lib/db/schema";

export interface SessionData {
  userId?: string;
  username?: string;
  role?: UserRole;
  isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
  isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ??
    "bbc-cashier-dev-secret-change-in-production-32chars",
  cookieName: "bbc-cashier-session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 12,
  },
};
