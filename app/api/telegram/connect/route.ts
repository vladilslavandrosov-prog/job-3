import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Store connect codes in-memory (in prod, use Redis or DB)
const pendingCodes = new Map<string, { userId: string; expiresAt: number }>();

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const code = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  pendingCodes.set(code, { userId: user.id, expiresAt: Date.now() + 15 * 60 * 1000 });

  return NextResponse.json({ code, expires_in: 900 });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const telegramId = searchParams.get('telegram_id');

  if (!code || !telegramId) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 });
  }

  const pending = pendingCodes.get(code);
  if (!pending || pending.expiresAt < Date.now()) {
    return NextResponse.json({ error: 'Code expired or invalid' }, { status: 400 });
  }

  pendingCodes.delete(code);

  const supabase = await createClient();
  const { data: tenantUser } = await supabase
    .from('tenant_users')
    .select('tenant_id')
    .eq('user_id', pending.userId)
    .single();

  if (!tenantUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { error } = await supabase
    .from('telegram_users')
    .upsert({
      tenant_id: tenantUser.tenant_id,
      user_id: pending.userId,
      telegram_id: BigInt(telegramId),
    }, { onConflict: 'telegram_id' });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
