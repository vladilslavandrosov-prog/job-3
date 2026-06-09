'use client';

import { useState } from 'react';
import { Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Props {
  user: { email: string; metadata: Record<string, unknown> };
  company: string;
  telegramConnected: boolean;
  telegramId: number | null;
}

export function ProfileForm({ user, company, telegramConnected, telegramId }: Props) {
  const [displayName, setDisplayName] = useState((user.metadata.full_name as string) ?? '');
  const [phone, setPhone] = useState((user.metadata.phone as string) ?? '');
  const [saving, setSaving] = useState(false);
  const [connectCode, setConnectCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { full_name: displayName, phone },
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success('Профиль обновлён');
  }

  async function generateConnectCode() {
    const res = await fetch('/api/telegram/connect', { method: 'POST' });
    const data = await res.json();
    setConnectCode(data.code);
  }

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT ?? 'TenderIntelBot';

  return (
    <div className="space-y-8">
      {/* Profile */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <h2 className="font-semibold text-[var(--text)] mb-5">Профиль</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user.email} disabled className="opacity-60" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Имя</Label>
            <Input
              id="name"
              placeholder="Иван Иванов"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+7 900 000-00-00"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Компания</Label>
            <Input value={company} disabled className="opacity-60" />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </form>
      </section>

      {/* Telegram */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <h2 className="font-semibold text-[var(--text)] mb-2">Telegram-уведомления</h2>
        <p className="text-sm text-[var(--text-muted)] mb-5">
          Получайте новые тендеры в Telegram по вашим фильтрам
        </p>

        {telegramConnected ? (
          <div className="flex items-center gap-2 text-sm text-green-400">
            <CheckCircle className="h-5 w-5" />
            Telegram подключён (ID: {telegramId})
          </div>
        ) : (
          <div className="space-y-4">
            {!connectCode ? (
              <Button onClick={generateConnectCode} variant="outline">
                Получить код подключения
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-[var(--text-2)]">
                  1. Откройте бота{' '}
                  <a
                    href={`https://t.me/${botName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--primary)] hover:underline inline-flex items-center gap-1"
                  >
                    @{botName} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </p>
                <p className="text-sm text-[var(--text-2)]">2. Отправьте команду:</p>
                <div className="flex items-center gap-2 rounded-lg bg-[var(--border)] px-4 py-3 font-mono text-sm">
                  <span className="flex-1">/connect {connectCode}</span>
                  <button onClick={() => handleCopy(`/connect ${connectCode}`)}>
                    {copied
                      ? <CheckCircle className="h-4 w-4 text-green-400" />
                      : <Copy className="h-4 w-4 text-[var(--text-muted)] hover:text-[var(--text)]" />
                    }
                  </button>
                </div>
                <p className="text-xs text-[var(--text-muted)]">Код действителен 15 минут</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Danger zone */}
      <section className="rounded-xl border border-red-500/30 bg-red-500/5 p-6">
        <h2 className="font-semibold text-red-400 mb-2">Опасная зона</h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">Необратимые действия</p>
        <Button variant="destructive" size="sm" disabled>
          Удалить аккаунт
        </Button>
        <p className="text-xs text-[var(--text-muted)] mt-2">Для удаления аккаунта свяжитесь с поддержкой</p>
      </section>
    </div>
  );
}
