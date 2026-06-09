'use client';

import { useState, useEffect } from 'react';
import type { Tender } from '@/types';

interface UseTendersOptions {
  search?: string;
  platform?: string;
  decision?: string;
  min_amount?: number;
  max_amount?: number;
}

export function useTenders(options: UseTendersOptions = {}) {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (options.search) params.set('search', options.search);
    if (options.platform) params.set('platform', options.platform);
    if (options.decision) params.set('decision', options.decision);
    if (options.min_amount) params.set('min_amount', String(options.min_amount));
    if (options.max_amount) params.set('max_amount', String(options.max_amount));

    setLoading(true);
    fetch(`/api/tenders?${params}`)
      .then(r => r.json())
      .then(data => {
        setTenders(data.tenders ?? []);
        setTotal(data.total ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [options.search, options.platform, options.decision, options.min_amount, options.max_amount]);

  async function updateDecision(tenderId: string, decision: string) {
    await fetch(`/api/tenders/${tenderId}/decision`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision }),
    });
    setTenders(prev =>
      prev.map(t => t.id === tenderId ? { ...t, decision: decision as Tender['decision'] } : t)
    );
  }

  return { tenders, total, loading, updateDecision };
}
