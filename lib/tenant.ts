import type { SupabaseClient } from '@supabase/supabase-js';

export async function getOrCreateTenant(supabase: SupabaseClient, userId: string): Promise<string> {
  const { data: tenantUser } = await supabase
    .from('tenant_users')
    .select('tenant_id')
    .eq('user_id', userId)
    .single();

  if (tenantUser) return tenantUser.tenant_id;

  // No tenant yet — create one
  const { data: tenant, error } = await supabase
    .from('tenants')
    .insert({ name: 'Моя компания', plan: 'starter' })
    .select('id')
    .single();

  if (error || !tenant) throw new Error('Failed to create tenant: ' + error?.message);

  await supabase
    .from('tenant_users')
    .insert({ tenant_id: tenant.id, user_id: userId, role: 'owner' });

  return tenant.id;
}
