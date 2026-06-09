import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: tenantUser } = await supabase
    .from('tenant_users')
    .select('tenant_id, tenants(plan, subscription_expires_at)')
    .eq('user_id', user.id)
    .single();

  const tenants = tenantUser?.tenants as unknown as { plan: string; subscription_expires_at: string | null } | null;

  return NextResponse.json({
    plan: tenants?.plan ?? 'starter',
    expires_at: tenants?.subscription_expires_at ?? null,
  });
}
