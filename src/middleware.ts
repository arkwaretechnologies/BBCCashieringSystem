import { NextResponse, type NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { canAccessPath } from "@/lib/auth/roles";
import { defaultSession, sessionOptions, type SessionData } from "@/lib/auth/session";

const publicPaths = ["/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/backup") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(request, response, sessionOptions);

  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  if (!session.isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session.isLoggedIn && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (session.isLoggedIn && session.role && !canAccessPath(session.role, pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
