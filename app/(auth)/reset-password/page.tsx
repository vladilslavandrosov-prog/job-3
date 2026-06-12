'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/api/auth/callback?next=/settings`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-[var(--primary)]" />
            <span className="text-2xl font-bold text-[var(--text)]">TenderIntel</span>
          </Link>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-4xl mb-4">📧</div>
              <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Письмо отправлено</h1>
              <p className="text-[var(--text-muted)] text-sm mb-6">
                Проверьте почту {email} и перейдите по ссылке для сброса пароля.
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full">Вернуться ко входу</Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Сброс пароля</h1>
              <p className="text-[var(--text-muted)] text-sm mb-6">
                Введите email, мы пришлём ссылку для сброса.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@company.ru" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Отправляем...' : 'Отправить ссылку'}
                </Button>
              </form>
              <p className="text-center text-sm text-[var(--text-muted)] mt-6">
                <Link href="/login" className="text-[var(--primary)] hover:underline">← Вернуться ко входу</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
