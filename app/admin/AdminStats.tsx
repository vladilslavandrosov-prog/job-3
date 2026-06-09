'use client';

import Link from 'next/link';
import { Users, Building2, TrendingUp, UserPlus, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

const PLAN_BADGE: Record<string, string> = {
  starter:   'bg-[var(--border)] text-[var(--text-muted)]',
  team:      'bg-blue-500/20 text-blue-400',
  corporate: 'bg-[var(--primary)]/20 text-[var(--primary)]',
};

const FLASK_STATUS: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  ok:          { icon: <CheckCircle className="h-4 w-4" />, label: 'Работает',   color: 'text-green-400' },
  error:       { icon: <XCircle className="h-4 w-4" />,    label: 'Ошибка',     color: 'text-red-400' },
  unavailable: { icon: <AlertCircle className="h-4 w-4" />, label: 'Недоступен', color: 'text-yellow-400' },
  unknown:     { icon: <AlertCircle className="h-4 w-4" />, label: 'Неизвестно', color: 'text-[var(--text-muted)]' },
};

export function AdminStats({ tenants, users, mrr, newThisWeek, recentTenants, flaskStatus }: {
  tenants: number;
  users: number;
  mrr: number;
  newThisWeek: number;
  recentTenants: { id: string; name: string; plan: string; created_at: string }[];
  flaskStatus: string;
}) {
  const flask = FLASK_STATUS[flaskStatus] ?? FLASK_STATUS.unknown;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Admin — Дашборд</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">Обзор платформы</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Building2 className="h-5 w-5" />, label: 'Тенанты',         value: tenants,  color: 'text-blue-400' },
          { icon: <Users className="h-5 w-5" />,     label: 'Пользователи',    value: users,    color: 'text-purple-400' },
          { icon: <TrendingUp className="h-5 w-5" />,label: 'MRR (₽)',         value: mrr.toLocaleString('ru'), color: 'text-green-400' },
          { icon: <UserPlus className="h-5 w-5" />,  label: 'Новых за 7 дней', value: newThisWeek, color: 'text-yellow-400' },
        ].map(({ icon, label, value, color }) => (
          <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <div className={`mb-3 ${color}`}>{icon}</div>
            <p className="text-2xl font-bold text-[var(--text)]">{value}</p>
            <p className="text-sm text-[var(--text-muted)]">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent tenants */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[var(--text)]">Последние клиенты</h2>
            <Link href="/admin/tenants" className="text-xs text-[var(--primary)] hover:underline">Все →</Link>
          </div>
          {recentTenants.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">Нет клиентов</p>
          ) : (
            <div className="space-y-3">
              {recentTenants.map(t => (
                <Link key={t.id} href={`/admin/tenants/${t.id}`} className="flex items-center justify-between hover:bg-[var(--border)]/30 rounded-lg px-2 py-1.5 -mx-2 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">{t.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{formatDate(t.created_at)}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PLAN_BADGE[t.plan] ?? ''}`}>
                    {t.plan}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* System health */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <h2 className="font-semibold text-[var(--text)] mb-4">Состояние системы</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="text-sm text-[var(--text-2)]">Next.js App</span>
              <span className="flex items-center gap-1.5 text-xs text-green-400">
                <CheckCircle className="h-3.5 w-3.5" />Работает
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
              <span className="text-sm text-[var(--text-2)]">Supabase</span>
              <span className="flex items-center gap-1.5 text-xs text-green-400">
                <CheckCircle className="h-3.5 w-3.5" />Подключён
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-[var(--text-2)]">Flask Backend</span>
              <span className={`flex items-center gap-1.5 text-xs ${flask.color}`}>
                {flask.icon}{flask.label}
              </span>
            </div>
          </div>
          <Link href="/admin/system" className="mt-4 inline-block text-xs text-[var(--primary)] hover:underline">
            Подробнее →
          </Link>
        </div>
      </div>
    </div>
  );
}
