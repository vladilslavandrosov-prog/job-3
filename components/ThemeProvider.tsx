'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) setThemeState(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    function applyTheme(t: Theme) {
      const dark =
        t === 'dark' ||
        (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

      root.classList.toggle('dark', dark);
      setResolvedTheme(dark ? 'dark' : 'light');
    }

    applyTheme(theme);

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => { if (theme === 'system') applyTheme('system'); };
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, [theme]);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem('theme', t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
