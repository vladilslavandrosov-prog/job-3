import { NextResponse } from 'next/server';

export async function GET() {
  let flaskStatus = 'unknown';
  try {
    const res = await fetch(`${process.env.FLASK_BACKEND_URL}/api/health`, { signal: AbortSignal.timeout(3000) });
    flaskStatus = res.ok ? 'ok' : 'error';
  } catch {
    flaskStatus = 'unavailable';
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: { flask: flaskStatus },
  });
}
