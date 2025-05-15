import { NextRequest, NextResponse } from 'next/server'
import { serialize } from 'cookie'

export async function POST(req: NextRequest) {
  const body = await req.json()

  try {
    // Gửi đến server backend thật sự
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    const data = await res.json()
    const token = data.token

    // Set token vào cookie (HttpOnly)
    const response = NextResponse.json({ message: 'Login success' })
    response.headers.set(
      'Set-Cookie',
      serialize('token', token, {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60, // 1 hour
        sameSite: 'lax',
      })
    )

    return response
  } catch (error) {
    return NextResponse.json({ message: 'Login failed' }, { status: 500 })
  }
}
