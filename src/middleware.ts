import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { mockServers } from "@/lib/mockData";

// export default NextAuth(authConfig).auth;

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const PUBLIC_PATHS = ['/login', '/register', '/api']

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
    
    // If user is on root path, redirect based on servers
    if (pathname === '/') {
      if (mockServers.length > 0) {
        // Redirect to first server's first channel
        const firstServer = mockServers[0];
        const firstChannel = firstServer.channels[0];
        return NextResponse.redirect(
          new URL(`/${firstServer.id}/channels/${firstChannel.id}`, req.url)
        );
      } else {
        // Redirect to direct messages with first user
        return NextResponse.redirect(
          new URL('/messages/1', req.url)
        );
      }
    }

    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next).*)"],
};