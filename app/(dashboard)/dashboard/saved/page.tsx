import { createClient } from '@/lib/supabase/server';
import { SavedTendersFeed } from './SavedFeed';

export default async function SavedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: saved } = await supabase
    .from('saved_tenders')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false });

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">Сохранённые тендеры</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          {saved?.length ?? 0} тендеров с вашими решениями
        </p>
      </div>
      <SavedTendersFeed savedItems={saved ?? []} />
    </div>
  );
}
