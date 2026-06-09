'use client';

import { useState } from 'react';
import { Brain, Download, CheckCircle, XCircle, AlertTriangle, Users, Code, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSSE } from '@/hooks/useSSE';
import { cn } from '@/lib/utils';

interface AnalysisMessage {
  type: 'progress' | 'section' | 'recommendation';
  text?: string;
  key?: string;
  value?: 'participate' | 'decline';
  reason?: string;
}

const SECTION_META: Record<string, { icon: React.ReactNode; label: string }> = {
  summary:    { icon: <FileText className="h-4 w-4" />,    label: 'Суть требований' },
  tech_stack: { icon: <Code className="h-4 w-4" />,        label: 'Технический стек' },
  team:       { icon: <Users className="h-4 w-4" />,       label: 'Требования к команде' },
  risks:      { icon: <AlertTriangle className="h-4 w-4" />, label: 'Риски' },
};

export function AIAnalysisPanel({ tenderId, plan }: { tenderId: string; plan: string }) {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const { data: rawMessages, status, reset } = useSSE(streamUrl);

  const messages: AnalysisMessage[] = rawMessages
    .map(m => { try { return JSON.parse(m) as AnalysisMessage; } catch { return null; } })
    .filter(Boolean) as AnalysisMessage[];

  const sections = messages.filter(m => m.type === 'section');
  const recommendation = messages.find(m => m.type === 'recommendation');
  const progressMsg = messages.filter(m => m.type === 'progress').at(-1);

  const progressPct =
    status === 'idle' || status === 'connecting' ? 0 :
    status === 'streaming' ? Math.min(90, sections.length * 22) :
    status === 'done' ? 100 : 0;

  async function handleStart() {
    reset();
    setStarted(true);
    await fetch(`/api/tenders/${tenderId}/analyze`, { method: 'POST' });
    setStreamUrl(`/api/tenders/${tenderId}/stream`);
  }

  async function handleDownloadPdf() {
    const res = await fetch(`/api/tenders/${tenderId}/report`);
    if (!res.ok) { alert('PDF недоступен в режиме mock'); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `tender-${tenderId}.pdf`; a.click();
    URL.revokeObjectURL(url);
  }

  function toggleSection(key: string) {
    setExpanded(p => ({ ...p, [key]: !p[key] }));
  }

  const isRunning = status === 'connecting' || status === 'streaming';
  const isDone = status === 'done';

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-[var(--primary)]" />
          <h2 className="font-semibold text-[var(--text)]">AI-анализ</h2>
        </div>
        {isDone && (
          <Button size="sm" variant="outline" onClick={handleDownloadPdf} className="gap-2">
            <Download className="h-4 w-4" />PDF-отчёт
          </Button>
        )}
      </div>

      {/* Idle — start button */}
      {!started && (
        <div className="text-center py-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)]/10 mb-4">
            <Brain className="h-7 w-7 text-[var(--primary)]" />
          </div>
          <p className="text-[var(--text-2)] mb-4 text-sm">
            Запустите AI-анализ: суть требований, стек, команда, риски и рекомендация
          </p>
          <Button onClick={handleStart} disabled={plan === 'none'}>
            Запустить AI-анализ
          </Button>
        </div>
      )}

      {/* Progress */}
      {isRunning && (
        <div className="space-y-3">
          <Progress value={progressPct} className="h-1.5" />
          <p className="text-xs text-[var(--text-muted)] animate-pulse">
            {progressMsg?.text ?? 'Анализирую...'}
          </p>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="text-center py-4 text-red-400 text-sm">
          <p>Ошибка подключения.</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={handleStart}>Повторить</Button>
        </div>
      )}

      {/* Sections */}
      {(isRunning || isDone) && sections.length > 0 && (
        <div className="mt-4 space-y-2">
          {sections.map(s => {
            const meta = SECTION_META[s.key!] ?? { icon: <FileText className="h-4 w-4" />, label: s.key };
            const open = expanded[s.key!] ?? true;
            return (
              <div key={s.key} className="rounded-lg border border-[var(--border)] overflow-hidden">
                <button
                  onClick={() => toggleSection(s.key!)}
                  className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-[var(--text-2)] hover:bg-[var(--border)]/30 transition-colors"
                >
                  <span className="flex items-center gap-2 text-[var(--text-muted)]">
                    {meta.icon}{meta.label}
                  </span>
                  {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {open && (
                  <div className="px-4 pb-4 text-sm text-[var(--text-2)] leading-relaxed">
                    {s.text}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Recommendation */}
      {recommendation && (
        <div className={cn(
          'mt-4 rounded-xl border p-4',
          recommendation.value === 'participate'
            ? 'border-green-500/30 bg-green-500/10'
            : 'border-red-500/30 bg-red-500/10'
        )}>
          <div className="flex items-center gap-2 mb-2">
            {recommendation.value === 'participate'
              ? <CheckCircle className="h-5 w-5 text-green-400" />
              : <XCircle className="h-5 w-5 text-red-400" />
            }
            <span className={cn('font-semibold', recommendation.value === 'participate' ? 'text-green-400' : 'text-red-400')}>
              {recommendation.value === 'participate' ? 'Рекомендуем участвовать' : 'Не рекомендуем участвовать'}
            </span>
          </div>
          <p className="text-sm text-[var(--text-2)]">{recommendation.reason}</p>
        </div>
      )}
    </div>
  );
}
