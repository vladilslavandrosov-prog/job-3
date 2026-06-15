import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from './ProfileForm';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: tenantUser } = await supabase
    .from('tenant_users')
    .select('role, tenants(name, plan)')
    .eq('user_id', user!.id)
    .single();

  const tenant = tenantUser?.tenants as unknown as { name: string; plan: string } | null;

  const { data: telegramUser } = await supabase
    .from('telegram_users')
    .select('telegram_id, filters, paused_until')
    .eq('user_id', user!.id)
    .maybeSingle();

  return (
    <div className="p-4 md:p-6 max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Настройки</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">Профиль, уведомления, Telegram-интеграция</p>
      </div>
      <ProfileForm
        user={{ email: user!.email!, metadata: user!.user_metadata ?? {} }}
        company={tenant?.name ?? ''}
        telegramConnected={!!telegramUser?.telegram_id}
        telegramId={telegramUser?.telegram_id ?? null}
      />
    </div>
  );
}
