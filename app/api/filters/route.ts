import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const schema = z.object({
  platforms: z.array(z.string()).min(1, 'Выберите хотя бы одну площадку'),
  min_amount: z.number().nullable().default(null),
  max_amount: z.number().nullable().default(null),
  tech_stack: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  notifications_enabled: z.boolean().default(true),
});

export async function POST(request: Request) {
  console.log('[filters/POST] start');
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  console.log('[filters/POST] user:', user?.id ?? null, 'error:', userError?.message ?? null);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  console.log('[filters/POST] body:', JSON.stringify(body));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    console.log('[filters/POST] validation error:', parsed.error.issues[0].message);
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  // Save or update telegram_users filters (if connected)
  const { error: tgError } = await supabase
    .from('telegram_users')
    .update({ filters: parsed.data })
    .eq('user_id', user.id);
  console.log('[filters/POST] telegram_users update error:', tgError?.message ?? null);

  // Store onboarding filters in user metadata
  const { error: metaError } = await supabase.auth.updateUser({
    data: {
      onboarding_completed: true,
      filters: parsed.data,
    },
  });
  console.log('[filters/POST] updateUser error:', metaError?.message ?? null);

  console.log('[filters/POST] done');
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const filters = user.user_metadata?.filters ?? null;
  return NextResponse.json({ filters });
}
