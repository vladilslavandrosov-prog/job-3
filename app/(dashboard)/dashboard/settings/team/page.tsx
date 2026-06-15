import { createClient } from '@/lib/supabase/server';
import { TeamManager } from './TeamManager';

export default async function TeamPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: tenantUser } = await supabase
    .from('tenant_users')
    .select('tenant_id, role, tenants(plan)')
    .eq('user_id', user!.id)
    .single();

  const plan = (tenantUser?.tenants as unknown as { plan: string } | null)?.plan ?? 'starter';

  const { data: members } = await supabase
    .from('tenant_users')
    .select('id, user_id, role, created_at')
    .eq('tenant_id', tenantUser?.tenant_id ?? '')
    .order('created_at');

  return (
    <div className="p-4 md:p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Команда</h1>
      <p className="text-[var(--text-muted)] text-sm mb-8">Управление участниками и приглашениями</p>
      <TeamManager
        members={members ?? []}
        currentUserId={user!.id}
        currentRole={tenantUser?.role ?? 'member'}
        plan={plan as 'starter' | 'team' | 'corporate'}
      />
    </div>
  );
}
