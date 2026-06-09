'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { canUseFeature, type Plan, type Feature } from '@/lib/permissions';
import { cn } from '@/lib/utils';

const FEATURE_LABELS: Record<Feature, string> = {
  AI_ANALYSIS:       'AI-анализ',
  TEAM_MANAGEMENT:   'Командная работа',
  CRM_INTEGRATION:   'CRM-интеграция',
  EXCEL_EXPORT:      'Экспорт в Excel',
  API_ACCESS:        'API-доступ',
  UNLIMITED_HISTORY: 'Безлимитная история',
};

const REQUIRED_PLAN: Record<Feature, string> = {
  AI_ANALYSIS:       'Старт',
  TEAM_MANAGEMENT:   'Команда',
  CRM_INTEGRATION:   'Команда',
  EXCEL_EXPORT:      'Команда',
  API_ACCESS:        'Корпоратив',
  UNLIMITED_HISTORY: 'Корпоратив',
};

interface SubscriptionGateProps {
  feature: Feature;
  plan: Plan;
  children: React.ReactNode;
  className?: string;
}

export function SubscriptionGate({ feature, plan, children, className }: SubscriptionGateProps) {
  if (canUseFeature(plan, feature)) {
    return <>{children}</>;
  }

  return (
    <div className={cn('relative', className)}>
      <div className="pointer-events-none select-none blur-sm opacity-50 saturate-0">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-card)]/60 backdrop-blur-[2px] rounded-xl">
        <div className="text-center p-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--border)] mb-3">
            <Lock className="h-5 w-5 text-[var(--text-muted)]" />
          </div>
          <p className="font-semibold text-[var(--text)] mb-1">{FEATURE_LABELS[feature]}</p>
          <p className="text-sm text-[var(--text-muted)] mb-4">
            Доступно на тарифе{' '}
            <span className="text-[var(--primary)] font-medium">«{REQUIRED_PLAN[feature]}»</span>
          </p>
          <Link href="/dashboard/settings/subscription">
            <Button size="sm">Улучшить план</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
