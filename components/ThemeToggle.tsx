'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className={cn(
        'rounded-lg p-2 transition-colors hover:bg-[var(--border)]',
        className
      )}
      aria-label="Toggle theme"
    >
      {resolvedTheme === 'dark' ? (
        <Sun className="h-5 w-5 text-[var(--text-muted)]" />
      ) : (
        <Moon className="h-5 w-5 text-[var(--text-muted)]" />
      )}
    </button>
  );
}
