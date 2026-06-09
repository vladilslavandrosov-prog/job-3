import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: tenantUser } = await supabase.from('tenant_users').select('role').eq('user_id', user.id).single();
  if (!tenantUser || tenantUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [{ count: tenantCount }, { count: userCount }, { data: payments }] = await Promise.all([
    supabase.from('tenants').select('*', { count: 'exact', head: true }),
    supabase.from('tenant_users').select('*', { count: 'exact', head: true }),
    supabase.from('payments').select('amount').eq('status', 'succeeded'),
  ]);

  const mrr = (payments ?? []).reduce((sum, p) => sum + p.amount, 0) / 100;

  return NextResponse.json({
    tenants: tenantCount ?? 0,
    users: userCount ?? 0,
    mrr,
  });
}
