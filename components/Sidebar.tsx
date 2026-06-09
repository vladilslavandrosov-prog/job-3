'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Brain, LayoutDashboard, Bookmark, Settings, LogOut, Users, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Тендеры' },
  { href: '/dashboard/saved', icon: Bookmark, label: 'Сохранённые' },
  { href: '/dashboard/settings', icon: Settings, label: 'Настройки' },
];

const BOTTOM_NAV = NAV;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success('Вы вышли из системы');
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-[var(--border)] bg-[var(--bg-card)]">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-[var(--border)]">
          <Brain className="h-7 w-7 text-[var(--primary)]" />
          <span className="text-lg font-bold text-[var(--text)]">TenderIntel</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                  ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                  : 'text-[var(--text-muted)] hover:bg-[var(--border)] hover:text-[var(--text)]'
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-[var(--border)] space-y-1">
          <ThemeToggle className="w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium text-[var(--text-muted)]" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--border)] hover:text-[var(--text)] transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-[var(--border)] bg-[var(--bg-card)] safe-bottom">
        <div className="flex items-center justify-around h-16">
          {BOTTOM_NAV.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 text-xs transition-colors',
                pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
                  ? 'text-[var(--primary)]'
                  : 'text-[var(--text-muted)]'
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}
