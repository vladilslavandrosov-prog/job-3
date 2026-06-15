'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Check, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const PLATFORMS = ['ЕИС', 'Росэлторг', 'СЭТП', 'РТС-тендер', 'Сбербанк-АСТ', 'ZakazRF'];

const TECH_PRESETS = [
  '1С', 'React', 'Angular', 'Vue', 'Node.js', 'Python', 'Java', '.NET', 'PHP',
  'PostgreSQL', 'Oracle', 'Docker', 'Kubernetes', 'Mobile (iOS/Android)', 'SAP', '1С-Битрикс',
];

const STEPS = ['Площадки', 'Бюджет', 'Стек', 'Готово'];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [platforms, setPlatforms] = useState<string[]>(['ЕИС']);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');

  function togglePlatform(p: string) {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }

  function toggleTech(t: string) {
    setTechStack(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  function addKeyword() {
    const kw = keywordInput.trim();
    if (kw && !keywords.includes(kw)) {
      setKeywords(prev => [...prev, kw]);
      setKeywordInput('');
    }
  }

  function removeKeyword(kw: string) {
    setKeywords(prev => prev.filter(k => k !== kw));
  }

  async function handleFinish() {
    if (platforms.length === 0) {
      toast.error('Выберите хотя бы одну площадку');
      setStep(0);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/filters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platforms,
          min_amount: minAmount ? Number(minAmount) * 1000 : null,
          max_amount: maxAmount ? Number(maxAmount) * 1000 : null,
          tech_stack: techStack,
          keywords,
          notifications_enabled: true,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Фильтры сохранены');
      router.push('/dashboard');
    } catch {
      toast.error('Не удалось сохранить фильтры');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Brain className="h-8 w-8 text-[var(--primary)]" />
          <span className="text-2xl font-bold text-[var(--text)]">TenderIntel</span>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-colors',
                i < step
                  ? 'bg-[var(--primary)] text-white'
                  : i === step
                    ? 'border-2 border-[var(--primary)] text-[var(--primary)]'
                    : 'border border-[var(--border)] text-[var(--text-muted)]'
              )}>
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('h-px w-8', i < step ? 'bg-[var(--primary)]' : 'bg-[var(--border)]')} />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-8">
          {/* Step 0 — Platforms */}
          {step === 0 && (
            <div>
              <h2 className="text-xl font-bold text-[var(--text)] mb-1">Выберите площадки</h2>
              <p className="text-sm text-[var(--text-muted)] mb-6">
                Откуда собирать тендеры? Можно выбрать несколько.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {PLATFORMS.map(p => (
                  <button
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 rounded-lg border text-sm font-medium transition-colors text-left',
                      platforms.includes(p)
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                        : 'border-[var(--border)] text-[var(--text-2)] hover:border-[var(--primary)]/50'
                    )}
                  >
                    {p}
                    {platforms.includes(p) && <Check className="h-4 w-4 shrink-0" />}
                  </button>
                ))}
              </div>
              <Button
                className="w-full mt-6"
                onClick={() => setStep(1)}
                disabled={platforms.length === 0}
              >
                Далее <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}

          {/* Step 1 — Budget */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-[var(--text)] mb-1">Бюджет тендеров</h2>
              <p className="text-sm text-[var(--text-muted)] mb-6">
                Укажите диапазон сумм в тысячах рублей (необязательно).
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-2)] mb-2">От (тыс. ₽)</label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={minAmount}
                    onChange={e => setMinAmount(e.target.value)}
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-2)] mb-2">До (тыс. ₽)</label>
                  <Input
                    type="number"
                    placeholder="50 000"
                    value={maxAmount}
                    onChange={e => setMaxAmount(e.target.value)}
                    min={0}
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>Назад</Button>
                <Button className="flex-1" onClick={() => setStep(2)}>
                  Далее <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2 — Tech stack + keywords */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-[var(--text)] mb-1">Технологии и ключевые слова</h2>
              <p className="text-sm text-[var(--text-muted)] mb-5">
                Мы будем подсвечивать тендеры, где упоминаются выбранные технологии.
              </p>

              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">Технологии</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {TECH_PRESETS.map(t => (
                  <button
                    key={t}
                    onClick={() => toggleTech(t)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                      techStack.includes(t)
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                        : 'border-[var(--border)] text-[var(--text-2)] hover:border-[var(--primary)]/50'
                    )}
                  >
                    {techStack.includes(t) && <span className="mr-1">✓</span>}{t}
                  </button>
                ))}
              </div>

              <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3">Ключевые слова</p>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Например: интеграция, ГИС..."
                  value={keywordInput}
                  onChange={e => setKeywordInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
                />
                <Button variant="outline" onClick={addKeyword} type="button">Добавить</Button>
              </div>
              {keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {keywords.map(kw => (
                    <Badge key={kw} variant="secondary" className="gap-1 pr-1">
                      {kw}
                      <button onClick={() => removeKeyword(kw)} className="ml-1 hover:text-red-400">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-3 mt-4">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Назад</Button>
                <Button className="flex-1" onClick={() => setStep(3)}>
                  Далее <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3 — Summary */}
          {step === 3 && (
            <div>
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">🎉</div>
                <h2 className="text-xl font-bold text-[var(--text)] mb-2">Всё готово!</h2>
                <p className="text-sm text-[var(--text-muted)]">Ваши фильтры настроены. Переходите в дашборд.</p>
              </div>

              <div className="space-y-3 mb-6 text-sm">
                <SummaryRow label="Площадки" value={platforms.join(', ')} />
                <SummaryRow
                  label="Бюджет"
                  value={
                    minAmount || maxAmount
                      ? `${minAmount ? `от ${Number(minAmount).toLocaleString('ru')} тыс. ₽` : ''} ${maxAmount ? `до ${Number(maxAmount).toLocaleString('ru')} тыс. ₽` : ''}`.trim()
                      : 'Любой'
                  }
                />
                <SummaryRow
                  label="Технологии"
                  value={techStack.length > 0 ? techStack.join(', ') : 'Все'}
                />
                <SummaryRow
                  label="Ключевые слова"
                  value={keywords.length > 0 ? keywords.join(', ') : 'Не указаны'}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Назад</Button>
                <Button className="flex-1" onClick={handleFinish} disabled={saving}>
                  {saving ? 'Сохраняем...' : 'Перейти в дашборд'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {step < 3 && (
          <p className="text-center text-xs text-[var(--text-muted)] mt-4">
            <button
              onClick={handleFinish}
              className="underline hover:text-[var(--text)] transition-colors"
            >
              Пропустить настройку
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-[var(--border)]">
      <span className="text-[var(--text-muted)] shrink-0">{label}</span>
      <span className="text-[var(--text-2)] text-right">{value}</span>
    </div>
  );
}
