'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDebouncedCallback } from 'use-debounce';

const PLATFORMS = ['ЕИС', 'Росэлторг', 'СЭТП', 'РТС-тендер', 'Сбербанк-АСТ'];
const DECISIONS = [
  { value: '', label: 'Все' },
  { value: 'interesting', label: 'Участвуем' },
  { value: 'deferred', label: 'Отложено' },
  { value: 'rejected', label: 'Отказ' },
  { value: 'none', label: 'Без решения' },
];

export function FiltersBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showMore, setShowMore] = useState(false);

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => router.replace(`${pathname}?${params.toString()}`));
  }

  const handleSearch = useDebouncedCallback((value: string) => {
    setParam('search', value);
  }, 300);

  function togglePlatform(platform: string) {
    const current = searchParams.get('platform') ?? '';
    const platforms = current ? current.split(',') : [];
    const updated = platforms.includes(platform)
      ? platforms.filter(p => p !== platform)
      : [...platforms, platform];
    setParam('platform', updated.join(','));
  }

  const selectedPlatforms = (searchParams.get('platform') ?? '').split(',').filter(Boolean);
  const selectedDecision = searchParams.get('decision') ?? '';
  const searchValue = searchParams.get('search') ?? '';
  const minAmount = searchParams.get('min_amount') ?? '';
  const maxAmount = searchParams.get('max_amount') ?? '';

  const hasActiveFilters = selectedPlatforms.length > 0 || selectedDecision || searchValue || minAmount || maxAmount;

  function clearAll() {
    startTransition(() => router.replace(pathname));
  }

  return (
    <div className="space-y-3">
      {/* Search + toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <Input
            placeholder="Поиск по названию или заказчику..."
            className="pl-9"
            defaultValue={searchValue}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>
        <Button
          variant={showMore ? 'default' : 'outline'}
          size="icon"
          title="Расширенные фильтры"
          onClick={() => setShowMore(v => !v)}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
        {hasActiveFilters && (
          <Button variant="outline" size="icon" title="Сбросить фильтры" onClick={clearAll}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Platform chips */}
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map(p => (
          <button
            key={p}
            onClick={() => togglePlatform(p)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
              selectedPlatforms.includes(p)
                ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]'
                : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)]/50'
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Extended filters */}
      {showMore && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 space-y-4">
          {/* Amount range */}
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">Сумма (тыс. ₽)</p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                placeholder="От"
                defaultValue={minAmount}
                onChange={e => setParam('min_amount', e.target.value)}
                min={0}
              />
              <Input
                type="number"
                placeholder="До"
                defaultValue={maxAmount}
                onChange={e => setParam('max_amount', e.target.value)}
                min={0}
              />
            </div>
          </div>

          {/* Decision filter */}
          <div>
            <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">Решение</p>
            <div className="flex flex-wrap gap-2">
              {DECISIONS.map(d => (
                <button
                  key={d.value}
                  onClick={() => setParam('decision', d.value)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                    selectedDecision === d.value
                      ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]'
                      : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)]/50'
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isPending && (
        <p className="text-xs text-[var(--text-muted)] animate-pulse">Обновление...</p>
      )}
    </div>
  );
}
