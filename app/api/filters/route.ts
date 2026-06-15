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
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  // Save or update telegram_users filters (if connected)
  await supabase
    .from('telegram_users')
    .update({ filters: parsed.data })
    .eq('user_id', user.id);

  // Store onboarding filters in user metadata
  await supabase.auth.updateUser({
    data: {
      onboarding_completed: true,
      filters: parsed.data,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const filters = user.user_metadata?.filters ?? null;
  return NextResponse.json({ filters });
}
