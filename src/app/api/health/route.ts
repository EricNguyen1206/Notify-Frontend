import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const healthUrl = process.env.NEXT_PUBLIC_API_HEALTH;
    if (!healthUrl) {
      throw new Error('NEXT_PUBLIC_API_HEALTH environment variable is not configured');
    }
    const res = await fetch(healthUrl, {
      cache: "no-store", // always call directly
    });
    // …rest of your logic…

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
