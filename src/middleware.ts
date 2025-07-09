import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export default function middleware(req: NextRequest) {
  // const { pathname } = req.nextUrl

  // const PUBLIC_PATHS = ['/login', '/register', '/api']

  // if (
  //   PUBLIC_PATHS.includes(pathname)
  // ) {
  //   return NextResponse.next()
  // }

  // const token = req.cookies.get('token')?.value

  // if (!token) {
  //   return NextResponse.redirect(new URL('/login', req.url))
  // }


  //   return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next).*)"],
};