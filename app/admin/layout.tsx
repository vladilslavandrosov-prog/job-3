import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: tenantUser } = await supabase.from('tenant_users').select('role').eq('user_id', user.id).single();
  if (!tenantUser || tenantUser.role !== 'admin') redirect('/dashboard');

  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <div className="max-w-7xl mx-auto">{children}</div>
    </div>
  );
}
