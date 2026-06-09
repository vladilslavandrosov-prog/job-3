'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, X, Pause, Clock, Building2, Package, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AIAnalysisPanel } from './AIAnalysisPanel';
import { formatCurrency, formatDate, daysUntil, cn } from '@/lib/utils';
import type { Tender, Decision, Plan } from '@/types';

interface Props {
  tender: Tender;
  plan: Plan;
}

const DECISION_CONFIG: Record<Decision, { label: string; className: string }> = {
  interesting: { label: 'Участвуем',  className: 'bg-green-500/20 text-green-400 border-green-400/30' },
  rejected:    { label: 'Отказ',      className: 'bg-red-500/20 text-red-400 border-red-400/30' },
  deferred:    { label: 'Отложено',   className: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30' },
};

export function TenderDetail({ tender, plan }: Props) {
  const [decision, setDecision] = useState<Decision | undefined>(tender.decision);
  const days = daysUntil(tender.deadline);
  const isUrgent = days >= 0 && days < 3;

  async function handleDecision(d: Decision) {
    setDecision(d);
    await fetch(`/api/tenders/${tender.id}/decision`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: d }),
    });
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Back */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
        <ArrowLeft className="h-4 w-4" />Назад к ленте
      </Link>

      {/* Header card */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary">{tender.platform}</Badge>
          {isUrgent && <Badge variant="destructive">Срочно</Badge>}
          {decision && (
            <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border', DECISION_CONFIG[decision].className)}>
              {DECISION_CONFIG[decision].label}
            </span>
          )}
        </div>

        <h1 className="text-xl font-bold text-[var(--text)] mb-4 leading-snug">{tender.title}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <MetaItem icon={<Package className="h-4 w-4" />} label="Сумма" value={formatCurrency(tender.amount)} bold />
          <MetaItem icon={<Building2 className="h-4 w-4" />} label="Заказчик" value={tender.zakazchik} />
          <MetaItem
            icon={<Clock className="h-4 w-4" />}
            label="Срок подачи"
            value={`${formatDate(tender.deadline)} (${days < 0 ? 'истёк' : `${days} дн.`})`}
            urgent={isUrgent}
          />
        </div>

        {/* Tech stack */}
        {tender.tech_stack && tender.tech_stack.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">Технологии</p>
            <div className="flex flex-wrap gap-2">
              {tender.tech_stack.map(t => (
                <span key={t} className="px-2.5 py-1 rounded-full text-xs bg-[var(--border)] text-[var(--text-2)]">{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {tender.description && (
          <div className="mb-5">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">Описание</p>
            <p className="text-sm text-[var(--text-2)] leading-relaxed whitespace-pre-wrap">{tender.description}</p>
          </div>
        )}

        {/* Requirements */}
        {tender.requirements && (
          <div className="mb-5">
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">Требования</p>
            <p className="text-sm text-[var(--text-2)] leading-relaxed whitespace-pre-wrap">{tender.requirements}</p>
          </div>
        )}

        {/* Decision buttons */}
        <div className="pt-4 border-t border-[var(--border)]">
          <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">Ваше решение</p>
          <div className="flex flex-wrap gap-3">
            <Button
              size="sm"
              variant={decision === 'interesting' ? 'default' : 'outline'}
              className={decision === 'interesting' ? 'bg-green-500 hover:bg-green-600' : ''}
              onClick={() => handleDecision('interesting')}
            >
              <Check className="h-4 w-4 mr-1.5" />Участвуем
            </Button>
            <Button
              size="sm"
              variant={decision === 'deferred' ? 'default' : 'outline'}
              className={decision === 'deferred' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
              onClick={() => handleDecision('deferred')}
            >
              <Pause className="h-4 w-4 mr-1.5" />Отложить
            </Button>
            <Button
              size="sm"
              variant={decision === 'rejected' ? 'default' : 'outline'}
              className={decision === 'rejected' ? 'bg-red-500 hover:bg-red-600' : ''}
              onClick={() => handleDecision('rejected')}
            >
              <X className="h-4 w-4 mr-1.5" />Отказ
            </Button>
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      <AIAnalysisPanel tenderId={tender.id} plan={plan} />
    </div>
  );
}

function MetaItem({
  icon, label, value, bold, urgent,
}: {
  icon: React.ReactNode; label: string; value: string; bold?: boolean; urgent?: boolean;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-[var(--text-muted)] mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-[var(--text-muted)]">{label}</p>
        <p className={cn('text-sm', bold ? 'font-semibold text-[var(--text)]' : 'text-[var(--text-2)]', urgent ? 'text-red-400' : '')}>{value}</p>
      </div>
    </div>
  );
}
