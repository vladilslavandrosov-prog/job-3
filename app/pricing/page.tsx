import Link from 'next/link';
import { Check, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';

const PLANS = [
  {
    id: 'starter',
    name: 'Старт',
    price: 10000,
    desc: 'Для одного специалиста',
    popular: false,
    features: [
      '1 пользователь',
      '30 AI-анализов в месяц',
      'Telegram-алерты (базовые)',
      'PDF-отчёты',
      'История 30 дней',
      'Email-поддержка 48 ч',
    ],
    unavailable: ['Командная работа', 'Excel-экспорт', 'API-доступ'],
  },
  {
    id: 'team',
    name: 'Команда',
    price: 18000,
    desc: 'Для отдела продаж',
    popular: true,
    features: [
      'До 5 пользователей',
      '150 AI-анализов в месяц',
      'Telegram-алерты (расширенные)',
      'PDF + Excel-экспорт',
      'История 6 месяцев',
      'Командная работа',
      'Email + чат 24 ч',
    ],
    unavailable: ['API-доступ'],
  },
  {
    id: 'corporate',
    name: 'Корпоратив',
    price: 25000,
    desc: 'Для крупных компаний',
    popular: false,
    features: [
      'Безлимит пользователей',
      'Безлимит AI-анализов',
      'Приоритетные Telegram-алерты',
      'PDF + Excel + API',
      'Безлимитная история',
      'Командная работа',
      'API-доступ',
      'Выделенный менеджер',
    ],
    unavailable: [],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="border-b border-[var(--border)] bg-[var(--bg-card)]">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="h-7 w-7 text-[var(--primary)]" />
            <span className="text-xl font-bold text-[var(--text)]">TenderIntel</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login"><Button variant="outline" size="sm">Войти</Button></Link>
            <Link href="/register"><Button size="sm">Начать</Button></Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-[var(--text)] mb-4">Тарифные планы</h1>
          <p className="text-xl text-[var(--text-muted)]">
            Начните с любого тарифа — upgrade или downgrade в любой момент
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border p-8 flex flex-col ${
                plan.popular
                  ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-lg shadow-[var(--primary)]/10'
                  : 'border-[var(--border)] bg-[var(--bg-card)]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="px-4 py-1">Популярный</Badge>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[var(--text)] mb-1">{plan.name}</h2>
                <p className="text-sm text-[var(--text-muted)] mb-4">{plan.desc}</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-[var(--text)]">
                    {plan.price.toLocaleString('ru')} ₽
                  </span>
                  <span className="text-[var(--text-muted)] mb-1">/мес</span>
                </div>
              </div>

              <ul className="space-y-2.5 flex-1 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[var(--text-2)]">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
                {plan.unavailable.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[var(--text-muted)] line-through">
                    <span className="h-4 w-4 mt-0.5 shrink-0 flex items-center justify-center text-[var(--border)]">—</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link href={`/register?plan=${plan.id}`}>
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  size="lg"
                >
                  Выбрать {plan.name}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8 text-center">
          <h3 className="text-xl font-bold text-[var(--text)] mb-2">Нужна кастомная интеграция?</h3>
          <p className="text-[var(--text-muted)] mb-4">
            Свяжитесь с нами для индивидуального предложения
          </p>
          <Button variant="outline">Написать в поддержку</Button>
        </div>
      </div>
    </div>
  );
}
