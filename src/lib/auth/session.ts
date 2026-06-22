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

// LAN deployments use HTTP (not HTTPS), so Secure cookies are rejected by browsers
// on client PCs. Only enable when actually serving over HTTPS.
const useSecureCookies = process.env.SESSION_SECURE === "true";

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ??
    "bbc-cashier-dev-secret-change-in-production-32chars",
  cookieName: "bbc-cashier-session",
  cookieOptions: {
    httpOnly: true,
    secure: useSecureCookies,
    sameSite: "lax",
    maxAge: 60 * 60 * 12,
  },
};
