import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const PLAN_BADGE: Record<string, string> = {
  starter:   '',
  team:      'bg-blue-500/20 text-blue-400',
  corporate: 'bg-[var(--primary)]/20 text-[var(--primary)]',
};

export default async function AdminTenantsPage() {
  const supabase = await createClient();

  const { data: tenants } = await supabase
    .from('tenants')
    .select('id, name, plan, subscription_expires_at, created_at')
    .order('created_at', { ascending: false });

  const memberCounts = await supabase
    .from('tenant_users')
    .select('tenant_id');

  const countMap: Record<string, number> = {};
  (memberCounts.data ?? []).forEach(r => {
    countMap[r.tenant_id] = (countMap[r.tenant_id] ?? 0) + 1;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--text)] mb-6">Клиенты ({tenants?.length ?? 0})</h1>
      <div className="rounded-xl border border-[var(--border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--border)]/20">
              {['Компания', 'План', 'Участники', 'Подписка до', 'Зарегистрирован'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs text-[var(--text-muted)] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(tenants ?? []).map(t => (
              <tr key={t.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--border)]/10">
                <td className="px-4 py-3">
                  <Link href={`/admin/tenants/${t.id}`} className="font-medium text-[var(--text)] hover:text-[var(--primary)]">
                    {t.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${PLAN_BADGE[t.plan] ?? 'bg-[var(--border)] text-[var(--text-muted)]'}`}>
                    {t.plan}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--text-2)]">{countMap[t.id] ?? 0}</td>
                <td className="px-4 py-3 text-[var(--text-2)]">
                  {t.subscription_expires_at ? formatDate(t.subscription_expires_at) : '—'}
                </td>
                <td className="px-4 py-3 text-[var(--text-muted)]">{formatDate(t.created_at)}</td>
              </tr>
            ))}
            {!tenants?.length && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-[var(--text-muted)]">Клиентов пока нет</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
