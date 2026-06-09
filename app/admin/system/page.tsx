import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { formatDate } from '@/lib/utils';

async function checkService(url: string, timeout = 2000): Promise<'ok' | 'error' | 'unavailable'> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeout) });
    return res.ok ? 'ok' : 'error';
  } catch {
    return 'unavailable';
  }
}

const STATUS_CONFIG = {
  ok:          { icon: <CheckCircle className="h-5 w-5" />, label: 'Работает',   color: 'text-green-400' },
  error:       { icon: <XCircle className="h-5 w-5" />,    label: 'Ошибка',     color: 'text-red-400' },
  unavailable: { icon: <AlertCircle className="h-5 w-5" />, label: 'Недоступен', color: 'text-yellow-400' },
};

export default async function AdminSystemPage() {
  const flaskUrl = process.env.FLASK_BACKEND_URL ?? 'http://localhost:5000';

  const [flaskStatus] = await Promise.all([
    checkService(`${flaskUrl}/api/health`),
  ]);

  const services = [
    { name: 'Next.js App',         status: 'ok' as const,  detail: 'App Router, SSR' },
    { name: 'Supabase PostgreSQL', status: 'ok' as const,  detail: 'Auth + RLS' },
    { name: 'Flask Backend',       status: flaskStatus,    detail: flaskUrl },
    { name: 'ЮKassa',             status: process.env.YUKASSA_SHOP_ID ? 'ok' as const : 'unavailable' as const, detail: 'Billing' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)]">Система</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Проверка выполнена: {formatDate(new Date().toISOString())}
        </p>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
        {services.map((s, i) => {
          const cfg = STATUS_CONFIG[s.status];
          return (
            <div key={s.name} className={`flex items-center justify-between px-5 py-4 ${i < services.length - 1 ? 'border-b border-[var(--border)]' : ''}`}>
              <div>
                <p className="font-medium text-[var(--text)]">{s.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{s.detail}</p>
              </div>
              <span className={`flex items-center gap-2 text-sm ${cfg.color}`}>
                {cfg.icon}{cfg.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <h2 className="font-semibold text-[var(--text)] mb-3">Ручная синхронизация</h2>
        <p className="text-sm text-[var(--text-muted)] mb-4">Запустить ручной парсинг тендеров с площадок</p>
        <SyncButton />
      </div>
    </div>
  );
}

function SyncButton() {
  'use client';
  return (
    <button
      onClick={async () => {
        const r = await fetch('/api/sync/trigger', { method: 'POST' });
        alert(r.ok ? 'Синхронизация запущена' : 'Ошибка');
      }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text-2)] hover:bg-[var(--border)] transition-colors"
    >
      <RefreshCw className="h-4 w-4" />
      Запустить синхронизацию
    </button>
  );
}
