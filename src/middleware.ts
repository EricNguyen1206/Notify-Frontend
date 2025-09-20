import { NextRequest, NextResponse } from "next/server";

export default async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // Define public paths that don't require authentication
  const PUBLIC_PATHS = ["/login", "/register", "/api"];

  // Define auth paths that authenticated users shouldn't access
  const AUTH_PATHS = ["/login", "/register"];

  // Get token from cookies
  const token = req.cookies.get("token")?.value;

  // --- 🔥 NEW: Check backend health before anything else ---
  // Skip health check for static/_next/api/waking-up to avoid loops
  const SKIP_PATHS = ["/api", "/_next", "/static", "/waking-up"];
  if (!SKIP_PATHS.some((p) => pathname.startsWith(p))) {
    try {
      const res = await fetch(`${origin}/api/health`, { cache: "no-store" });
      if (!res.ok) {
        const url = req.nextUrl.clone();
        url.pathname = "/waking-up";
        return NextResponse.rewrite(url);
      }
    } catch (e) {
      const url = req.nextUrl.clone();
      url.pathname = "/waking-up";
      return NextResponse.rewrite(url);
    }
  }

  // --- 🔑 Auth logic as before ---
  if (AUTH_PATHS.includes(pathname)) {
    if (token) {
      return NextResponse.redirect(new URL("/messages", req.url));
    }
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (pathname === "/") {
    if (token) {
      return NextResponse.redirect(new URL("/messages", req.url));
    } else {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next).*)"],
};
