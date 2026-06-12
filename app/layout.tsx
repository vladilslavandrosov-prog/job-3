import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from 'sonner';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5F5F8' },
    { media: '(prefers-color-scheme: dark)',  color: '#0B0B0F' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL?.startsWith('http')
      ? process.env.NEXT_PUBLIC_APP_URL
      : `https://${process.env.NEXT_PUBLIC_APP_URL ?? 'tenderintel.ru'}`
  ),
  title: {
    default: 'TenderIntel — AI-агрегатор ИТ-тендеров',
    template: '%s | TenderIntel',
  },
  description:
    'Находите выгодные ИТ-тендеры с помощью искусственного интеллекта. AI-анализ, фильтры по площадкам, Telegram-уведомления.',
  keywords: 'тендеры, ИТ-тендеры, госзакупки, AI анализ, агрегатор тендеров, закупки',
  authors: [{ name: 'TenderIntel' }],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'TenderIntel',
    title: 'TenderIntel — AI-агрегатор ИТ-тендеров',
    description: 'Находите выгодные ИТ-тендеры быстрее конкурентов с помощью AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TenderIntel — AI-агрегатор ИТ-тендеров',
    description: 'Находите выгодные ИТ-тендеры быстрее конкурентов с помощью AI',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--bg)] text-[var(--text)]">
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
