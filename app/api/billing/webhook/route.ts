import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const body = await request.json();

  if (body.type !== 'payment.succeeded') {
    return NextResponse.json({ ok: true });
  }

  const payment = body.object;
  const { user_id, plan } = payment.metadata ?? {};

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

  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  await supabase.from('tenants').update({
    plan,
    subscription_expires_at: expiresAt.toISOString(),
  }).eq('id', tenantUser.tenant_id);

  await supabase.from('payments').insert({
    tenant_id: tenantUser.tenant_id,
    yukassa_payment_id: payment.id,
    amount: Math.round(parseFloat(payment.amount.value) * 100),
    plan,
    status: 'succeeded',
  });

  return NextResponse.json({ ok: true });
}
