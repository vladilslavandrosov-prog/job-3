import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getOrCreateTenant } from '@/lib/tenant';
import { z } from 'zod';

const schema = z.object({ decision: z.enum(['interesting', 'rejected', 'deferred']) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid decision' }, { status: 400 });

  const tenantId = await getOrCreateTenant(supabase, user.id).catch(() => null);
  if (!tenantId) return NextResponse.json({ error: 'Tenant error' }, { status: 500 });

  const { error } = await supabase
    .from('saved_tenders')
    .upsert({
      tenant_id: tenantId,
      user_id: user.id,
      tender_id: id,
      decision: parsed.data.decision,
    }, { onConflict: 'tenant_id,tender_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
