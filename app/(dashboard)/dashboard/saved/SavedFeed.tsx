'use client';

import { useState, useEffect } from 'react';
import { TenderCard } from '@/components/TenderCard';
import type { Tender, Decision } from '@/types';

interface SavedItem {
  tender_id: string;
  decision: string | null;
  created_at: string;
}

interface Props {
  savedItems: SavedItem[];
}

export function SavedTendersFeed({ savedItems }: Props) {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(savedItems.length > 0);

  useEffect(() => {
    if (savedItems.length === 0) return;

    // Fetch tender details for each saved item
    Promise.all(
      savedItems.map(item =>
        fetch(`/api/tenders/${item.tender_id}`)
          .then(r => r.json())
          .then(data => ({ ...data, decision: item.decision } as Tender))
          .catch(() => null)
      )
    ).then(results => {
      setTenders(results.filter(Boolean) as Tender[]);
      setLoading(false);
    });
  }, [savedItems]);

  if (savedItems.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-12 text-center">
        <p className="text-4xl mb-3">📋</p>
        <p className="font-medium text-[var(--text)]">Нет сохранённых тендеров</p>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Ставьте ✓ / ✗ / ⏸ на карточках в ленте — они появятся здесь
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[...Array(Math.min(savedItems.length, 6))].map((_, i) => (
          <div key={i} className="h-44 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] animate-pulse" />
        ))}
      </div>
    );
  }

  const byDecision: Record<string, Tender[]> = {
    interesting: tenders.filter(t => t.decision === 'interesting'),
    deferred: tenders.filter(t => t.decision === 'deferred'),
    rejected: tenders.filter(t => t.decision === 'rejected'),
  };

  const GROUPS = [
    { key: 'interesting', label: '✅ Участвуем', color: 'text-green-400' },
    { key: 'deferred',    label: '⏸ Отложено',  color: 'text-yellow-400' },
    { key: 'rejected',    label: '❌ Отказ',     color: 'text-red-400' },
  ];

  async function updateDecision(id: string, decision: Decision) {
    await fetch(`/api/tenders/${id}/decision`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision }),
    });
    setTenders(prev => prev.map(t => t.id === id ? { ...t, decision } : t));
  }

  return (
    <div className="space-y-8">
      {GROUPS.map(({ key, label, color }) => {
        const group = byDecision[key];
        if (group.length === 0) return null;
        return (
          <div key={key}>
            <h2 className={`text-sm font-semibold mb-3 ${color}`}>{label} ({group.length})</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {group.map(tender => (
                <TenderCard key={tender.id} tender={tender} onDecision={updateDecision} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
