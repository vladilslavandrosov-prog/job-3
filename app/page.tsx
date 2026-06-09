import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Brain, Bell, Users, BarChart3, ChevronRight, Check,
  Zap, Shield, Globe, ArrowRight, Star,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'TenderIntel — AI-агрегатор ИТ-тендеров | Находите выгодные тендеры быстрее',
  description:
    'TenderIntel собирает ИТ-тендеры с ЕИС, Росэлторг и других площадок, анализирует требования с помощью AI и отправляет персональные уведомления в Telegram. Начните бесплатно.',
  keywords: 'тендеры, ИТ-тендеры, госзакупки, AI анализ тендеров, агрегатор тендеров',
  openGraph: {
    title: 'TenderIntel — AI-агрегатор ИТ-тендеров',
    description: 'Находите выгодные ИТ-тендеры быстрее конкурентов с помощью AI-анализа',
    type: 'website',
    locale: 'ru_RU',
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-card)]/90 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-7 w-7 text-[var(--primary)]" />
            <span className="text-xl font-bold text-[var(--text)]">TenderIntel</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--text-muted)]">
            <Link href="#features" className="hover:text-[var(--text)] transition-colors">Возможности</Link>
            <Link href="#how" className="hover:text-[var(--text)] transition-colors">Как работает</Link>
            <Link href="/pricing" className="hover:text-[var(--text)] transition-colors">Тарифы</Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login"><Button variant="outline" size="sm">Войти</Button></Link>
            <Link href="/register"><Button size="sm" className="hidden sm:flex">Начать бесплатно</Button></Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-24 text-center">
        <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm">
          🤖 Работает на основе AI
        </Badge>
        <h1 className="text-5xl md:text-6xl font-bold text-[var(--text)] mb-6 leading-tight">
          Находите выгодные<br />
          ИТ-тендеры{' '}
          <span className="text-[var(--primary)]">быстрее конкурентов</span>
        </h1>
        <p className="text-xl text-[var(--text-muted)] max-w-2xl mx-auto mb-10">
          TenderIntel автоматически собирает тендеры с ЕИС, Росэлторг и других площадок,
          анализирует требования с помощью AI и мгновенно уведомляет вашу команду.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="gap-2 w-full sm:w-auto">
              Начать бесплатно <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Посмотреть тарифы
            </Button>
          </Link>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-4">Без карты. Первые 7 дней бесплатно.</p>
      </section>

      {/* Social proof */}
      <section className="border-y border-[var(--border)] bg-[var(--bg-card)] py-10">
        <div className="mx-auto max-w-7xl px-4 flex flex-wrap items-center justify-center gap-8 text-center">
          {[
            { value: '500+', label: 'тендеров ежедневно' },
            { value: '6',    label: 'площадок мониторинга' },
            { value: '< 5 мин', label: 'время AI-анализа' },
            { value: '24/7', label: 'мониторинг' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-bold text-[var(--primary)]">{value}</p>
              <p className="text-sm text-[var(--text-muted)]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-[var(--text)] mb-4">
            Всё, что нужно для работы с тендерами
          </h2>
          <p className="text-[var(--text-muted)] max-w-xl mx-auto">
            От парсинга до PDF-отчёта — весь рабочий процесс в одном продукте
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 hover:border-[var(--primary)]/40 transition-colors">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                <Icon className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text)] mb-2">{title}</h3>
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-[var(--bg-card)] border-y border-[var(--border)] py-24">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-3xl font-bold text-center text-[var(--text)] mb-14">Как это работает</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {STEPS.map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-white text-lg font-bold mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-[var(--text)] mb-2">{title}</h3>
                <p className="text-sm text-[var(--text-muted)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[var(--text)] mb-4">Тарифные планы</h2>
          <p className="text-[var(--text-muted)]">Upgrade или downgrade в любой момент</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
          {PLANS.map(({ name, price, popular, features }) => (
            <div
              key={name}
              className={`rounded-2xl border p-6 flex flex-col ${
                popular ? 'border-[var(--primary)] bg-[var(--primary)]/5 shadow-lg shadow-[var(--primary)]/10' : 'border-[var(--border)] bg-[var(--bg-card)]'
              }`}
            >
              {popular && <Badge className="mb-3 self-start">Популярный</Badge>}
              <h3 className="text-xl font-bold text-[var(--text)]">{name}</h3>
              <div className="my-3">
                <span className="text-3xl font-bold text-[var(--text)]">{price} ₽</span>
                <span className="text-[var(--text-muted)]">/мес</span>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[var(--text-2)]">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/register">
                <Button variant={popular ? 'default' : 'outline'} className="w-full">Выбрать</Button>
              </Link>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link href="/pricing" className="inline-flex items-center gap-2 text-sm text-[var(--primary)] hover:underline">
            Сравнить все тарифы подробно <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-[var(--primary)]/30 bg-[var(--primary)]/5 p-12">
          <h2 className="text-3xl font-bold text-[var(--text)] mb-4">
            Начните выигрывать тендеры уже сегодня
          </h2>
          <p className="text-[var(--text-muted)] mb-8 max-w-xl mx-auto">
            Присоединяйтесь к компаниям, которые используют AI для поиска и анализа тендеров
          </p>
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Попробовать бесплатно <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--bg-card)]">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-6 w-6 text-[var(--primary)]" />
                <span className="font-bold text-[var(--text)]">TenderIntel</span>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                AI-агрегатор ИТ-тендеров для B2B рынка
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--text)] mb-3">Продукт</h4>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                <li><Link href="#features" className="hover:text-[var(--text)]">Возможности</Link></li>
                <li><Link href="/pricing" className="hover:text-[var(--text)]">Тарифы</Link></li>
                <li><Link href="/register" className="hover:text-[var(--text)]">Регистрация</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--text)] mb-3">Площадки</h4>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                {['ЕИС (zakupki.gov.ru)', 'Росэлторг', 'СЭТП', 'РТС-тендер'].map(p => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[var(--text)] mb-3">Компания</h4>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                <li><a href="mailto:support@tenderintel.ru" className="hover:text-[var(--text)]">Поддержка</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
            <span>© 2025 TenderIntel. Все права защищены.</span>
            <ThemeToggle />
          </div>
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  { icon: Brain,    title: 'AI-анализ',           desc: 'Автоматический разбор требований, выявление рисков и рекомендация: участвовать или нет' },
  { icon: Bell,     title: 'Telegram-уведомления', desc: 'Мгновенные алерты о новых тендерах по вашим фильтрам прямо в мессенджер' },
  { icon: Globe,    title: '6 площадок',           desc: 'ЕИС, Росэлторг, СЭТП, РТС-тендер, Сбербанк-АСТ и другие в одном интерфейсе' },
  { icon: Users,    title: 'Командная работа',     desc: 'Совместные решения ✓/✗/⏸, комментарии, распределение тендеров по менеджерам' },
  { icon: BarChart3,title: 'Аналитика',            desc: 'История решений, статистика участий, конверсия — знайте свои сильные стороны' },
  { icon: Zap,      title: 'PDF-отчёты',           desc: 'Экспорт полного AI-анализа в PDF для презентаций и внутренних согласований' },
];

const STEPS = [
  { step: 1, title: 'Настройте фильтры', desc: 'Выберите площадки, диапазон сумм и технологии за 2 минуты' },
  { step: 2, title: 'Получайте тендеры', desc: 'Система мониторит площадки и присылает новые тендеры в Telegram' },
  { step: 3, title: 'AI анализирует',    desc: 'Одна кнопка — и AI разбирает требования, стек, риски и даёт рекомендацию' },
  { step: 4, title: 'Принимайте решение', desc: 'Отмечайте тендеры, скачивайте отчёты и выигрывайте контракты' },
];

const PLANS = [
  {
    name: 'Старт', price: '10 000', popular: false,
    features: ['1 пользователь', '30 AI-анализов', 'Telegram-алерты', 'PDF-отчёты'],
  },
  {
    name: 'Команда', price: '18 000', popular: true,
    features: ['До 5 пользователей', '150 AI-анализов', 'Excel-экспорт', 'История 6 месяцев'],
  },
  {
    name: 'Корпоратив', price: '25 000', popular: false,
    features: ['Безлимит', 'Безлимит AI', 'API-доступ', 'Выделенный менеджер'],
  },
];
