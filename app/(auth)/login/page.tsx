'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Brain, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    const msg = searchParams.get('message');
    if (msg) setInfoMessage(decodeURIComponent(msg));
    const err = searchParams.get('error');
    if (err === 'auth_callback_error') toast.error('Ошибка подтверждения. Попробуйте ещё раз.');
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(
        error.message === 'Invalid login credentials' ? 'Неверный email или пароль' : error.message
      );
      return;
    }

    const onboardingDone = data.user?.user_metadata?.onboarding_completed;
    const redirectTo = searchParams.get('redirectTo') ?? (onboardingDone ? '/dashboard' : '/onboarding');
    router.push(redirectTo);
    router.refresh();
  }

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/api/auth/callback?next=/onboarding` },
    });
  }

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-8">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Войти в аккаунт</h1>
      <p className="text-[var(--text-muted)] text-sm mb-6">Введите email и пароль</p>

      {infoMessage && (
        <div className="flex items-start gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 mb-5 text-sm text-blue-400">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          {infoMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.ru"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Пароль</Label>
            <Link href="/reset-password" className="text-xs text-[var(--primary)] hover:underline">
              Забыли пароль?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Входим...' : 'Войти'}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[var(--bg-card)] px-2 text-xs text-[var(--text-muted)]">или</span>
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={handleGoogle}>
        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Войти через Google
      </Button>

      <p className="text-center text-sm text-[var(--text-muted)] mt-6">
        Нет аккаунта?{' '}
        <Link href="/register" className="text-[var(--primary)] hover:underline">Зарегистрироваться</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-[var(--primary)]" />
            <span className="text-2xl font-bold text-[var(--text)]">TenderIntel</span>
          </Link>
        </div>
        <Suspense fallback={<div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-8 text-center text-[var(--text-muted)]">Загрузка...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
