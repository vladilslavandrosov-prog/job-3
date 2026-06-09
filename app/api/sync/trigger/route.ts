import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: tenantUser } = await supabase.from('tenant_users').select('role').eq('user_id', user.id).single();
  if (!tenantUser || tenantUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (process.env.FLASK_BACKEND_URL) {
    try {
      const res = await fetch(`${process.env.FLASK_BACKEND_URL}/api/sync/trigger`, {
        method: 'POST',
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) return NextResponse.json({ ok: true, source: 'flask' });
    } catch {}
  }

  return NextResponse.json({ ok: true, source: 'mock', message: 'Flask unavailable — sync skipped' });
}
