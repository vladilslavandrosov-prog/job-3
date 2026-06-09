import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: tenantUser } = await supabase.from('tenant_users').select('tenant_id').eq('user_id', user.id).single();

  if (process.env.FLASK_BACKEND_URL) {
    try {
      const res = await fetch(`${process.env.FLASK_BACKEND_URL}/api/analyze/${id}`, {
        method: 'POST',
        headers: { 'X-Tenant-ID': tenantUser?.tenant_id ?? '', 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) return NextResponse.json(await res.json());
    } catch {}
  }

  return NextResponse.json({ job_id: `mock-${id}`, status: 'queued' });
}
