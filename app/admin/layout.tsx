import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Brain, LayoutDashboard, Building2, Settings, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin',         icon: LayoutDashboard, label: 'Дашборд' },
  { href: '/admin/tenants', icon: Building2,        label: 'Клиенты' },
  { href: '/admin/system',  icon: Monitor,          label: 'Система' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: tenantUser } = await supabase.from('tenant_users').select('role').eq('user_id', user.id).single();
  if (!tenantUser || tenantUser.role !== 'admin') redirect('/dashboard');

  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <aside className="w-64 h-screen sticky top-0 border-r border-[var(--border)] bg-[var(--bg-card)] flex flex-col">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-[var(--border)]">
          <Brain className="h-6 w-6 text-[var(--primary)]" />
          <div>
            <p className="font-bold text-[var(--text)] text-sm">TenderIntel</p>
            <p className="text-xs text-red-400 font-medium">Admin</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--border)] hover:text-[var(--text)] transition-colors"
            >
              <Icon className="h-4 w-4" />{label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-[var(--border)] space-y-1">
          <ThemeToggle />
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--text-muted)] hover:bg-[var(--border)] hover:text-[var(--text)] transition-colors">
            ← В приложение
          </Link>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-6">
        {children}
      </main>
    </div>
  );
}
