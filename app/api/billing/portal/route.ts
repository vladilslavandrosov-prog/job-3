import { NextResponse } from 'next/server';

// ЮKassa does not have a customer portal like Stripe.
// This endpoint returns billing page URL.
export async function GET() {
  return NextResponse.json({
    url: '/dashboard/settings/subscription',
  });
}
