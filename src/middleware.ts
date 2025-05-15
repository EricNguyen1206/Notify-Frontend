import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// export default NextAuth(authConfig).auth;

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const PUBLIC_PATHS = ['/', '/login', '/register', '/api']

  if (
    PUBLIC_PATHS.includes(pathname)
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get('token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    // jwt.verify(token, process.env.JWT_SECRET!)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next).*)"],
};