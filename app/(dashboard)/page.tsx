import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">Лента тендеров</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">Актуальные ИТ-тендеры с AI-анализом</p>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-8 text-center text-[var(--text-muted)]">
        <p className="text-4xl mb-4">🚀</p>
        <p className="font-medium text-[var(--text)]">Фаза 0 завершена</p>
        <p className="text-sm mt-2">Лента тендеров будет добавлена в Фазе 2</p>
      </div>
    </div>
  );
}
