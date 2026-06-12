'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', company_name: '', phone: '' });
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { company_name: form.company_name, phone: form.phone },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback?next=/onboarding`,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Проверьте почту для подтверждения регистрации');
      router.push(`/login?message=${encodeURIComponent('Письмо отправлено — подтвердите email и войдите')}`);
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
          <h1 className="text-2xl font-bold text-[var(--text)] mb-2">Создать аккаунт</h1>
          <p className="text-[var(--text-muted)] text-sm mb-6">Начните работу с TenderIntel бесплатно</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Название компании</Label>
              <Input id="company_name" placeholder="ООО Рога и Копыта" value={form.company_name} onChange={e => update('company_name', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@company.ru" value={form.email} onChange={e => update('email', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input id="phone" type="tel" placeholder="+7 900 000-00-00" value={form.phone} onChange={e => update('phone', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input id="password" type="password" placeholder="Минимум 8 символов" value={form.password} onChange={e => update('password', e.target.value)} required minLength={8} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
            </Button>
          </form>

          <p className="text-center text-sm text-[var(--text-muted)] mt-6">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="text-[var(--primary)] hover:underline">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
