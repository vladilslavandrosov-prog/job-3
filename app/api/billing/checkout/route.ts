import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const schema = z.object({
  plan: z.enum(['starter', 'team', 'corporate']),
  period: z.enum(['monthly', 'yearly']).default('monthly'),
});

const PRICES: Record<string, Record<string, number>> = {
  starter:   { monthly: 1000000, yearly: 10000000 },
  team:      { monthly: 1800000, yearly: 18000000 },
  corporate: { monthly: 2500000, yearly: 25000000 },
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

  const { plan, period } = parsed.data;
  const amount = PRICES[plan][period];

  const yukassaShopId = process.env.YUKASSA_SHOP_ID;
  const yukassaSecret = process.env.YUKASSA_SECRET_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  if (!yukassaShopId || !yukassaSecret) {
    return NextResponse.json({ error: 'Billing not configured' }, { status: 503 });
  }

  const idempotenceKey = crypto.randomUUID();
  const res = await fetch('https://api.yookassa.ru/v3/payments', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${yukassaShopId}:${yukassaSecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
      'Idempotence-Key': idempotenceKey,
    },
    body: JSON.stringify({
      amount: { value: (amount / 100).toFixed(2), currency: 'RUB' },
      capture: true,
      confirmation: {
        type: 'redirect',
        return_url: `${appUrl}/dashboard/settings/subscription?success=true`,
      },
      description: `Подписка TenderIntel — ${plan} (${period})`,
      metadata: { user_id: user.id, plan, period },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json({ error: err.description ?? 'Payment creation failed' }, { status: 500 });
  }

  const payment = await res.json();
  return NextResponse.json({ payment_url: payment.confirmation.confirmation_url, payment_id: payment.id });
}
