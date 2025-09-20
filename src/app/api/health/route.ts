import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_API_HEALTH + "", {
      cache: "no-store", // always call directly
    });

    if (res.ok) {
      return NextResponse.json(
        { 
          status: 'ok', 
          timestamp: new Date().toISOString(),
          service: 'notify-frontend'
        },
        { status: 200 }
      );
    }
  } catch (e) {
    console.log(e);
  }
  return NextResponse.json(
    { 
      status: 'error', 
      timestamp: new Date().toISOString(),
      service: 'notify-frontend'
    },
    { status: 503 }
  );
}
