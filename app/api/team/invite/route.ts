import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });

  const { data: tenantUser } = await supabase
    .from('tenant_users')
    .select('tenant_id, role, tenants(plan)')
    .eq('user_id', user.id)
    .single();

  if (!tenantUser || !['owner', 'admin'].includes(tenantUser.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const plan = (tenantUser.tenants as unknown as { plan: string } | null)?.plan ?? 'starter';
  if (plan === 'starter') {
    return NextResponse.json({ error: 'Team management requires Team plan or higher' }, { status: 403 });
  }

  // Check if invited user already exists
  const service = await createServiceClient();
  const { data: invitedUser } = await service.auth.admin.listUsers();
  const existing = invitedUser?.users.find(u => u.email === parsed.data.email);

  if (existing) {
    const { error } = await service
      .from('tenant_users')
      .upsert({
        tenant_id: tenantUser.tenant_id,
        user_id: existing.id,
        role: 'member',
      }, { onConflict: 'tenant_id,user_id' });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, message: 'User added to team' });
  }

  // Invite via Supabase magic link
  const { error } = await service.auth.admin.inviteUserByEmail(parsed.data.email, {
    data: { invited_to_tenant: tenantUser.tenant_id },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, message: 'Invitation sent' });
}
