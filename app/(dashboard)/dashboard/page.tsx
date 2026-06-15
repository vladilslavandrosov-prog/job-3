import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { TenderFeed } from './TenderFeed';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: tenantUser } = await supabase
    .from('tenant_users')
    .select('role, tenants(plan)')
    .eq('user_id', user!.id)
    .single();

  const plan = (tenantUser?.tenants as unknown as { plan: string } | null)?.plan ?? 'starter';

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">Лента тендеров</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">Актуальные ИТ-тендеры с AI-анализом</p>
      </div>
      <Suspense fallback={<FeedSkeleton />}>
        <TenderFeed plan={plan as 'starter' | 'team' | 'corporate'} />
      </Suspense>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-44 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] animate-pulse" />
      ))}
    </div>
  );
}
