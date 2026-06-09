import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: tenantUser } = await supabase.from('tenant_users').select('tenant_id').eq('user_id', user.id).single();

  if (process.env.FLASK_BACKEND_URL) {
    try {
      const res = await fetch(`${process.env.FLASK_BACKEND_URL}/api/tender/${id}`, {
        headers: { 'X-Tenant-ID': tenantUser?.tenant_id ?? '' },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) return NextResponse.json(await res.json());
    } catch {}
  }

  return NextResponse.json({ id, title: 'Тендер (mock)', zakazchik: 'Заказчик', amount: 1000000, deadline: new Date().toISOString(), published_at: new Date().toISOString(), platform: 'ЕИС', status: 'active' });
}
