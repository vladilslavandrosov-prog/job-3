import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Crown, Shield, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDate, formatCurrency } from '@/lib/utils';

const ROLE_ICON: Record<string, React.ReactNode> = {
  owner:  <Crown className="h-3.5 w-3.5 text-yellow-400" />,
  admin:  <Shield className="h-3.5 w-3.5 text-blue-400" />,
  member: <User className="h-3.5 w-3.5 text-[var(--text-muted)]" />,
};

export default async function AdminTenantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: tenant }, { data: members }, { data: payments }] = await Promise.all([
    supabase.from('tenants').select('*').eq('id', id).single(),
    supabase.from('tenant_users').select('user_id, role, created_at').eq('tenant_id', id),
    supabase.from('payments').select('*').eq('tenant_id', id).order('created_at', { ascending: false }),
  ]);

  if (!tenant) notFound();

  return (
    <div className="space-y-6">
      <Link href="/admin/tenants" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
        <ArrowLeft className="h-4 w-4" />Все клиенты
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">{tenant.name}</h1>
          <p className="text-sm text-[var(--text-muted)]">ID: {tenant.id}</p>
        </div>
        <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-[var(--primary)]/20 text-[var(--primary)]">
          {tenant.plan}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Подписка до', value: tenant.subscription_expires_at ? formatDate(tenant.subscription_expires_at) : 'Нет подписки' },
          { label: 'Участников', value: String(members?.length ?? 0) },
          { label: 'Создан', value: formatDate(tenant.created_at) },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
            <p className="text-xs text-[var(--text-muted)] mb-1">{label}</p>
            <p className="font-semibold text-[var(--text)]">{value}</p>
          </div>
        ))}
      </div>

      {/* Members */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <h2 className="font-semibold text-[var(--text)] mb-4">Участники</h2>
        <div className="space-y-2">
          {(members ?? []).map(m => (
            <div key={m.user_id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
              <div className="flex items-center gap-2">
                {ROLE_ICON[m.role] ?? ROLE_ICON.member}
                <span className="text-sm text-[var(--text-2)] font-mono">{m.user_id.slice(0, 12)}...</span>
              </div>
              <span className="text-xs text-[var(--text-muted)]">{formatDate(m.created_at)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payments */}
      {(payments?.length ?? 0) > 0 && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <h2 className="font-semibold text-[var(--text)] mb-4">Платежи</h2>
          <div className="space-y-2">
            {(payments ?? []).map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                <div>
                  <span className="text-sm text-[var(--text-2)]">{formatDate(p.created_at)}</span>
                  <span className="mx-2 text-[var(--border)]">·</span>
                  <span className="text-sm text-[var(--text-muted)]">{p.plan}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[var(--text)]">{formatCurrency(p.amount / 100)}</span>
                  <span className={`text-xs ${p.status === 'succeeded' ? 'text-green-400' : p.status === 'canceled' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
