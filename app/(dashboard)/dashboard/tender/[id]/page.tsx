import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TenderDetail } from '@/components/TenderDetail';
import type { Tender } from '@/types';

export default async function TenderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: tenantUser } = await supabase
    .from('tenant_users')
    .select('tenant_id, tenants(plan)')
    .eq('user_id', user!.id)
    .single();

  const plan = (tenantUser?.tenants as unknown as { plan: string } | null)?.plan ?? 'starter';

  // Fetch tender from Flask or mock
  let tender: Tender;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/tenders/${id}`,
      { headers: { Cookie: '' } }
    );
    if (!res.ok) notFound();
    tender = await res.json();
  } catch {
    // Fallback mock for build/SSR
    tender = {
      id,
      title: 'Разработка информационной системы',
      zakazchik: 'Заказчик',
      amount: 5000000,
      deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
      published_at: new Date().toISOString(),
      platform: 'ЕИС',
      status: 'active',
      tech_stack: ['React', 'Node.js', 'PostgreSQL'],
      description: 'Разработка корпоративной информационной системы.',
      requirements: 'Опыт разработки от 3 лет.',
    };
  }

  return <TenderDetail tender={tender} plan={plan as 'starter' | 'team' | 'corporate'} />;
}
