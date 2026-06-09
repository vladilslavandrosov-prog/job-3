'use client';

import { useState, useEffect } from 'react';
import type { Plan } from '@/types';

interface SubscriptionState {
  plan: Plan;
  expires_at: string | null;
  loading: boolean;
}

export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>({ plan: 'starter', expires_at: null, loading: true });

  useEffect(() => {
    fetch('/api/subscription/status')
      .then(r => r.json())
      .then(data => setState({ plan: data.plan, expires_at: data.expires_at, loading: false }))
      .catch(() => setState(s => ({ ...s, loading: false })));
  }, []);

  return state;
}
