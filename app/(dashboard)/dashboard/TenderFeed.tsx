'use client';

import { Suspense } from 'react';
import { FiltersBar } from '@/components/FiltersBar';
import { TenderCard } from '@/components/TenderCard';
import { useTenders } from '@/hooks/useTenders';
import { useSearchParams } from 'next/navigation';
import type { Plan, Decision } from '@/types';

function Feed({ plan }: { plan: Plan }) {
  const searchParams = useSearchParams();
  const { tenders, total, loading, updateDecision } = useTenders({
    search: searchParams.get('search') ?? undefined,
    platform: searchParams.get('platform') ?? undefined,
    decision: searchParams.get('decision') ?? undefined,
    min_amount: searchParams.get('min_amount') ? Number(searchParams.get('min_amount')) * 1000 : undefined,
    max_amount: searchParams.get('max_amount') ? Number(searchParams.get('max_amount')) * 1000 : undefined,
  });

  return (
    <div className="space-y-4">
      <FiltersBar />

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] animate-pulse" />
          ))}
        </div>
      ) : tenders.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-12 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium text-[var(--text)]">Тендеры не найдены</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Попробуйте изменить фильтры</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-[var(--text-muted)]">Найдено: {total}</p>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tenders.map(tender => (
              <TenderCard
                key={tender.id}
                tender={tender}
                onDecision={(id, decision) => updateDecision(id, decision)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function TenderFeed({ plan }: { plan: Plan }) {
  return (
    <Suspense fallback={null}>
      <Feed plan={plan} />
    </Suspense>
  );
}
