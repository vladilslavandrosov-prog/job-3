'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Check, CreditCard, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Payment {
  id: string;
  yukassa_payment_id: string;
  amount: number;
  plan: string;
  status: string;
  created_at: string;
}

const PLANS = [
  {
    id: 'starter' as const,
    name: 'Старт',
    price: 10000,
    features: ['1 пользователь', '30 AI-анализов', 'PDF-отчёты'],
  },
  {
    id: 'team' as const,
    name: 'Команда',
    price: 18000,
    features: ['5 пользователей', '150 AI-анализов', 'Excel-экспорт'],
  },
  {
    id: 'corporate' as const,
    name: 'Корпоратив',
    price: 25000,
    features: ['Безлимит', 'Безлимит AI', 'API-доступ'],
  },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  succeeded: { label: 'Оплачен',   color: 'text-green-400' },
  pending:   { label: 'В ожидании', color: 'text-yellow-400' },
  canceled:  { label: 'Отменён',   color: 'text-red-400' },
};

function SuccessBanner() {
  const searchParams = useSearchParams();
  if (!searchParams.get('success')) return null;
  return (
    <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-4 mb-6 text-sm text-green-400">
      <Check className="h-4 w-4 shrink-0" />
      Подписка успешно активирована!
    </div>
  );
}

export function SubscriptionManager({
  currentPlan, expiresAt, payments,
}: {
  currentPlan: 'starter' | 'team' | 'corporate';
  expiresAt: string | null;
  payments: Payment[];
}) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(planId: string) {
    setLoading(planId);
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId, period: 'monthly' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = data.payment_url;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Ошибка создания платежа');
      setLoading(null);
    }
  }

  return (
    <div className="space-y-8">
      <Suspense fallback={null}><SuccessBanner /></Suspense>

      {/* Current plan */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-[var(--text)]">Текущий план</h2>
          <Badge>{PLANS.find(p => p.id === currentPlan)?.name ?? currentPlan}</Badge>
        </div>
        {expiresAt && (
          <p className="text-sm text-[var(--text-muted)]">
            Активен до: <span className="text-[var(--text-2)]">{formatDate(expiresAt)}</span>
          </p>
        )}
        {!expiresAt && currentPlan !== 'starter' && (
          <div className="flex items-center gap-2 text-sm text-yellow-400 mt-2">
            <AlertCircle className="h-4 w-4" />Подписка истекла
          </div>
        )}
      </div>

      {/* Plan selection */}
      <div>
        <h2 className="font-semibold text-[var(--text)] mb-4">Изменить план</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {PLANS.map(plan => {
            const isCurrent = plan.id === currentPlan;
            return (
              <div
                key={plan.id}
                className={cn(
                  'rounded-xl border p-5 flex flex-col',
                  isCurrent ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border)] bg-[var(--bg-card)]'
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[var(--text)]">{plan.name}</h3>
                  {isCurrent && <Badge variant="secondary" className="text-xs">Текущий</Badge>}
                </div>
                <p className="text-2xl font-bold text-[var(--text)] mb-3">
                  {plan.price.toLocaleString('ru')} <span className="text-base font-normal text-[var(--text-muted)]">₽/мес</span>
                </p>
                <ul className="space-y-1.5 mb-4 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-[var(--text-2)]">
                      <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Button
                  size="sm"
                  variant={isCurrent ? 'outline' : 'default'}
                  disabled={isCurrent || loading === plan.id}
                  onClick={() => handleCheckout(plan.id)}
                >
                  {loading === plan.id ? 'Переход...' : isCurrent ? 'Активен' : 'Выбрать'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment history */}
      {payments.length > 0 && (
        <div>
          <h2 className="font-semibold text-[var(--text)] mb-4">История платежей</h2>
          <div className="rounded-xl border border-[var(--border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--border)]/20">
                  <th className="text-left px-4 py-3 text-xs text-[var(--text-muted)] font-medium">Дата</th>
                  <th className="text-left px-4 py-3 text-xs text-[var(--text-muted)] font-medium">План</th>
                  <th className="text-right px-4 py-3 text-xs text-[var(--text-muted)] font-medium">Сумма</th>
                  <th className="text-right px-4 py-3 text-xs text-[var(--text-muted)] font-medium">Статус</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--border)]/10">
                    <td className="px-4 py-3 text-[var(--text-2)]">{formatDate(p.created_at)}</td>
                    <td className="px-4 py-3 capitalize text-[var(--text-2)]">{p.plan}</td>
                    <td className="px-4 py-3 text-right text-[var(--text)]">{(p.amount / 100).toLocaleString('ru')} ₽</td>
                    <td className={`px-4 py-3 text-right ${STATUS_MAP[p.status]?.color ?? 'text-[var(--text-muted)]'}`}>
                      {STATUS_MAP[p.status]?.label ?? p.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2 flex items-center gap-1">
            <CreditCard className="h-3.5 w-3.5" />
            Тестовая карта: 4111 1111 1111 1111, любой CVV, любая дата
          </p>
        </div>
      )}
    </div>
  );
}
