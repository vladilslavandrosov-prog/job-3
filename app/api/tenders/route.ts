import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Tender } from '@/types';

// Mock data while Flask backend is unavailable
const MOCK_TENDERS: Tender[] = [
  {
    id: '1',
    title: 'Разработка информационной системы управления проектами',
    zakazchik: 'Министерство цифрового развития',
    amount: 4500000,
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    platform: 'ЕИС',
    status: 'active',
    tech_stack: ['React', 'Node.js', 'PostgreSQL'],
    is_new: true,
  },
  {
    id: '2',
    title: 'Создание корпоративного портала на базе 1С-Битрикс',
    zakazchik: 'ГУП Московский метрополитен',
    amount: 1200000,
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    platform: 'Росэлторг',
    status: 'active',
    tech_stack: ['1С-Битрикс', 'PHP'],
    decision: 'deferred',
  },
  {
    id: '3',
    title: 'Разработка мобильного приложения для учёта рабочего времени',
    zakazchik: 'ФГУП Почта России',
    amount: 8900000,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    platform: 'ЕИС',
    status: 'active',
    tech_stack: ['React Native', 'TypeScript', 'Python'],
    decision: 'interesting',
  },
];

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: tenantUser } = await supabase
    .from('tenant_users')
    .select('tenant_id')
    .eq('user_id', user.id)
    .single();

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const platform = searchParams.get('platform');
  const decision = searchParams.get('decision');
  const minAmount = searchParams.get('min_amount') ? Number(searchParams.get('min_amount')) : null;
  const maxAmount = searchParams.get('max_amount') ? Number(searchParams.get('max_amount')) : null;

  let tenders = MOCK_TENDERS;
  if (search) {
    const q = search.toLowerCase();
    tenders = tenders.filter(t =>
      t.title.toLowerCase().includes(q) || t.zakazchik.toLowerCase().includes(q)
    );
  }
  if (platform) {
    const platforms = platform.split(',');
    tenders = tenders.filter(t => platforms.includes(t.platform));
  }
  if (decision === 'none') {
    tenders = tenders.filter(t => !t.decision);
  } else if (decision) {
    tenders = tenders.filter(t => t.decision === decision);
  }
  if (minAmount !== null) tenders = tenders.filter(t => t.amount >= minAmount);
  if (maxAmount !== null) tenders = tenders.filter(t => t.amount <= maxAmount);

  // Try real Flask backend
  if (process.env.FLASK_BACKEND_URL) {
    try {
      const res = await fetch(`${process.env.FLASK_BACKEND_URL}/api/tenders?${searchParams}`, {
        headers: { 'X-Tenant-ID': tenantUser?.tenant_id ?? '' },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch {
      // fall through to mock
    }
  }

  return NextResponse.json({ tenders, total: tenders.length });
}
