import { createClient } from '@/lib/supabase/server';
import { AdminStats } from './AdminStats';

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: tenantsCount },
    { count: usersCount },
    { data: recentTenants },
    { data: payments },
    { data: recentSignups },
  ] = await Promise.all([
    supabase.from('tenants').select('*', { count: 'exact', head: true }),
    supabase.from('tenant_users').select('*', { count: 'exact', head: true }),
    supabase.from('tenants').select('id, name, plan, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('payments').select('amount, status, created_at').eq('status', 'succeeded'),
    supabase.from('tenants').select('created_at').gte(
      'created_at',
      new Date(Date.now() - 7 * 86400000).toISOString()
    ),
  ]);

  const mrr = (payments ?? []).reduce((s, p) => s + p.amount, 0) / 100;

  let flaskStatus = 'unknown';
  try {
    const res = await fetch(`${process.env.FLASK_BACKEND_URL ?? 'http://localhost:5000'}/api/health`, {
      signal: AbortSignal.timeout(2000),
    });
    flaskStatus = res.ok ? 'ok' : 'error';
  } catch {
    flaskStatus = 'unavailable';
  }

  return (
    <AdminStats
      tenants={tenantsCount ?? 0}
      users={usersCount ?? 0}
      mrr={mrr}
      newThisWeek={recentSignups?.length ?? 0}
      recentTenants={recentTenants ?? []}
      flaskStatus={flaskStatus}
    />
  );
}
