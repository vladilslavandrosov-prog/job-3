import { createClient } from '@/lib/supabase/server';
import { SubscriptionManager } from './SubscriptionManager';

export default async function SubscriptionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: tenantUser } = await supabase
    .from('tenant_users')
    .select('tenant_id, tenants(plan, subscription_expires_at)')
    .eq('user_id', user!.id)
    .single();

  const tenants = tenantUser?.tenants as unknown as { plan: string; subscription_expires_at: string | null } | null;

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('tenant_id', tenantUser?.tenant_id ?? '')
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Подписка</h1>
      <p className="text-[var(--text-muted)] text-sm mb-8">Управление тарифным планом и историей платежей</p>
      <SubscriptionManager
        currentPlan={(tenants?.plan ?? 'starter') as 'starter' | 'team' | 'corporate'}
        expiresAt={tenants?.subscription_expires_at ?? null}
        payments={payments ?? []}
      />
    </div>
  );
}
