import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Brain, Bell, Users, BarChart3, ChevronRight, Check } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Nav */}
      <header className="border-b border-[var(--border)] bg-[var(--bg-card)]">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-7 w-7 text-[var(--primary)]" />
            <span className="text-xl font-bold text-[var(--text)]">TenderIntel</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--text-muted)]">
            <Link href="/pricing" className="hover:text-[var(--text)] transition-colors">Тарифы</Link>
            <Link href="#features" className="hover:text-[var(--text)] transition-colors">Возможности</Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="outline" size="sm">Войти</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Начать</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-24 text-center">
        <Badge variant="secondary" className="mb-6 text-sm">
          🤖 AI-анализ тендеров
        </Badge>
        <h1 className="text-5xl font-bold text-[var(--text)] mb-6 leading-tight">
          Находите выгодные ИТ-тендеры
          <br />
          <span className="text-[var(--primary)]">быстрее конкурентов</span>
        </h1>
        <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-10">
          TenderIntel автоматически парсит площадки, анализирует требования с помощью AI
          и отправляет персональные уведомления в Telegram.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Попробовать бесплатно <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" size="lg">Посмотреть тарифы</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-[var(--text)] mb-12">
          Всё, что нужно для работы с тендерами
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary)]/10">
                <Icon className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">{title}</h3>
              <p className="text-sm text-[var(--text-muted)]">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-[var(--text)] mb-4">Тарифные планы</h2>
        <p className="text-center text-[var(--text-muted)] mb-12">Upgrade или downgrade в любой момент</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {PLANS.map(({ name, price, popular, features }) => (
            <div
              key={name}
              className={`rounded-xl border p-6 ${popular ? 'border-[var(--primary)] bg-[var(--primary)]/5' : 'border-[var(--border)] bg-[var(--bg-card)]'}`}
            >
              {popular && <Badge className="mb-3">Популярный</Badge>}
              <h3 className="text-xl font-bold text-[var(--text)]">{name}</h3>
              <div className="my-3">
                <span className="text-3xl font-bold text-[var(--text)]">{price} ₽</span>
                <span className="text-[var(--text-muted)]">/мес</span>
              </div>
              <ul className="space-y-2 mb-6">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[var(--text-2)]">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register">
                <Button variant={popular ? 'default' : 'outline'} className="w-full">Выбрать</Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--bg-card)] mt-20">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between text-sm text-[var(--text-muted)]">
          <span>© 2025 TenderIntel</span>
          <Link href="/pricing" className="hover:text-[var(--text)]">Тарифы</Link>
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  { icon: Brain, title: 'AI-анализ', desc: 'Мгновенный разбор требований, рисков и рекомендация к участию' },
  { icon: Bell, title: 'Telegram-алерты', desc: 'Получайте новые тендеры прямо в мессенджер по вашим фильтрам' },
  { icon: Users, title: 'Командная работа', desc: 'Совместные решения, комментарии и распределение тендеров' },
  { icon: BarChart3, title: 'Аналитика', desc: 'История решений, статистика участий и конверсия' },
];

const PLANS = [
  {
    name: 'Старт', price: '10 000', popular: false,
    features: ['1 пользователь', '30 AI-анализов/мес', 'Telegram-алерты', 'PDF-отчёты'],
  },
  {
    name: 'Команда', price: '18 000', popular: true,
    features: ['До 5 пользователей', '150 AI-анализов/мес', 'Excel-экспорт', 'История 6 месяцев'],
  },
  {
    name: 'Корпоратив', price: '25 000', popular: false,
    features: ['Безлимит пользователей', 'Безлимит AI-анализов', 'API-доступ', 'Выделенный менеджер'],
  },
];
