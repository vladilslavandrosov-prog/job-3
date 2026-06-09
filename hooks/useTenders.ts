'use client';

import { useState, useEffect } from 'react';
import type { Tender } from '@/types';

interface UseTendersOptions {
  search?: string;
  platform?: string;
  decision?: string;
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

    setLoading(true);
    fetch(`/api/tenders?${params}`)
      .then(r => r.json())
      .then(data => {
        setTenders(data.tenders ?? []);
        setTotal(data.total ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [options.search, options.platform, options.decision]);

  async function updateDecision(tenderId: string, decision: string) {
    await fetch(`/api/tenders/${tenderId}/decision`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision }),
    });
    setTenders(prev => prev.map(t => t.id === tenderId ? { ...t, decision: decision as Tender['decision'] } : t));
  }

  return { tenders, total, loading, updateDecision };
}
