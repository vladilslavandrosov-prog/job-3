'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, Pause, Clock, Zap, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn, formatCurrency, formatDate, daysUntil } from '@/lib/utils';
import type { Tender, Decision } from '@/types';

interface TenderCardProps {
  tender: Tender;
  onDecision?: (id: string, decision: Decision) => void;
}

const DECISION_CONFIG: Record<Decision, { label: string; color: string }> = {
  interesting: { label: 'Участвуем', color: 'text-green-400 bg-green-400/10 border-green-400/30' },
  rejected:    { label: 'Отказ',     color: 'text-red-400 bg-red-400/10 border-red-400/30' },
  deferred:    { label: 'Отложено',  color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' },
};

export function TenderCard({ tender, onDecision }: TenderCardProps) {
  const [localDecision, setLocalDecision] = useState<Decision | undefined>(tender.decision);
  const [saving, setSaving] = useState(false);

  const days = daysUntil(tender.deadline);
  const isUrgent = days >= 0 && days < 3;
  const isNew = tender.is_new || daysUntil(tender.published_at) > -1;

  async function handleDecision(decision: Decision) {
    if (saving) return;
    const prev = localDecision;
    setLocalDecision(decision);
    setSaving(true);
    try {
      await onDecision?.(tender.id, decision);
    } catch {
      setLocalDecision(prev);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={cn(
      'rounded-xl border bg-[var(--bg-card)] p-5 transition-all hover:border-[var(--primary)]/40 hover:shadow-sm',
      localDecision
        ? DECISION_CONFIG[localDecision].color.split(' ')[2]
        : 'border-[var(--border)]'
    )}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-xs">{tender.platform}</Badge>
          {isNew && (
            <Badge className="text-xs bg-blue-500/20 text-blue-400 border border-blue-400/30">Новый</Badge>
          )}
          {isUrgent && (
            <Badge variant="destructive" className="text-xs gap-1">
              <Zap className="h-3 w-3" />Срочно
            </Badge>
          )}
          {localDecision && (
            <span className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border',
              DECISION_CONFIG[localDecision].color
            )}>
              {DECISION_CONFIG[localDecision].label}
            </span>
          )}
        </div>

        {/* Quick decision buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <QuickBtn
            icon={<Check className="h-4 w-4" />}
            active={localDecision === 'interesting'}
            activeClass="bg-green-500/20 text-green-400 border-green-400/40"
            title="Участвуем"
            onClick={() => handleDecision('interesting')}
          />
          <QuickBtn
            icon={<Pause className="h-4 w-4" />}
            active={localDecision === 'deferred'}
            activeClass="bg-yellow-500/20 text-yellow-400 border-yellow-400/40"
            title="Отложить"
            onClick={() => handleDecision('deferred')}
          />
          <QuickBtn
            icon={<X className="h-4 w-4" />}
            active={localDecision === 'rejected'}
            activeClass="bg-red-500/20 text-red-400 border-red-400/40"
            title="Отказ"
            onClick={() => handleDecision('rejected')}
          />
        </div>
      </div>

      {/* Title */}
      <Link
        href={`/dashboard/tender/${tender.id}`}
        className="block text-[var(--text)] font-medium leading-snug hover:text-[var(--primary)] transition-colors mb-3 line-clamp-2"
      >
        {tender.title}
      </Link>

      {/* Meta */}
      <p className="text-sm text-[var(--text-muted)] mb-3 truncate">{tender.zakazchik}</p>

      {/* Tech stack */}
      {tender.tech_stack && tender.tech_stack.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {tender.tech_stack.slice(0, 5).map(t => (
            <span key={t} className="px-2 py-0.5 rounded text-xs bg-[var(--border)] text-[var(--text-muted)]">{t}</span>
          ))}
          {tender.tech_stack.length > 5 && (
            <span className="px-2 py-0.5 rounded text-xs bg-[var(--border)] text-[var(--text-muted)]">+{tender.tech_stack.length - 5}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-3 border-t border-[var(--border)]">
        <span className="font-semibold text-[var(--text-2)] text-sm">{formatCurrency(tender.amount)}</span>
        <div className="flex items-center gap-1">
          <Clock className={cn('h-3.5 w-3.5', isUrgent ? 'text-red-400' : '')} />
          <span className={cn(isUrgent ? 'text-red-400 font-medium' : '')}>
            {days < 0
              ? 'Срок истёк'
              : days === 0
                ? 'Сегодня'
                : `${days} дн.`
            }
          </span>
          <span className="mx-1">·</span>
          <span>{formatDate(tender.deadline)}</span>
        </div>
      </div>
    </div>
  );
}

function QuickBtn({
  icon, active, activeClass, title, onClick,
}: {
  icon: React.ReactNode;
  active: boolean;
  activeClass: string;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cn(
        'flex items-center justify-center w-8 h-8 rounded-lg border text-[var(--text-muted)] transition-colors hover:bg-[var(--border)]',
        active ? activeClass : 'border-[var(--border)]'
      )}
    >
      {icon}
    </button>
  );
}
