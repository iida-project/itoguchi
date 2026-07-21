import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { fontVariables } from '@/app/fonts';
import '../globals.css';

export const metadata: Metadata = {
  title: 'いとぐち — 南信州の伝統工芸',
  description: '南信州（飯田・下伊那）の伝統工芸ポータル。工芸の正本ページと体験・イベントの横断カレンダー。',
};

// ビルド時に /ja /en を静的生成する
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // 存在しないロケール（/fr など）は 404
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // 静的レンダリングを有効化
  setRequestLocale(locale);

  return (
    <html lang={locale} className={fontVariables}>
      <body className="antialiased">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
