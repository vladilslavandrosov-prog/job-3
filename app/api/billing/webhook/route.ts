import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { createHmac } from 'crypto';

const PERIOD_MONTHS: Record<string, number> = { monthly: 1, yearly: 12 };

export async function POST(request: Request) {
  const rawBody = await request.text();

  // Verify ЮKassa webhook signature
  const webhookSecret = process.env.YUKASSA_WEBHOOK_SECRET;
  if (webhookSecret) {
    const signature = request.headers.get('x-yukassa-signature') ?? '';
    const expected = createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
    if (signature !== expected) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (body.type !== 'payment.succeeded') {
    return NextResponse.json({ ok: true });
  }

  const payment = body.object as Record<string, unknown>;
  const metadata = (payment.metadata ?? {}) as Record<string, string>;
  const { user_id, plan, period: billing_period } = metadata;

  if (!user_id || !plan) {
    return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
  }

  const supabase = await createServiceClient();

  const { data: tenantUser } = await supabase
    .from('tenant_users')
    .select('tenant_id')
    .eq('user_id', user_id)
    .single();

  if (!tenantUser) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

  const months = PERIOD_MONTHS[billing_period ?? 'monthly'] ?? 1;

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + months);

  await supabase.from('tenants').update({
    plan,
    subscription_expires_at: expiresAt.toISOString(),
  }).eq('id', tenantUser.tenant_id);

  const amountValue = ((payment.amount as Record<string, string>) ?? {}).value ?? '0';
  await supabase.from('payments').insert({
    tenant_id: tenantUser.tenant_id,
    yukassa_payment_id: payment.id as string,
    amount: Math.round(parseFloat(amountValue) * 100),
    plan,
    status: 'succeeded',
  });

  return NextResponse.json({ ok: true });
}
