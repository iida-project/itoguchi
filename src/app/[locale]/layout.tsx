import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { fontVariables } from '@/app/fonts';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SITE_URL, SITE_PHASE, siteName } from '@/lib/seo/config';
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/JsonLd';
import '../globals.css';

type MetadataProps = { params: Promise<{ locale: string }> };

/**
 * サイト全体の既定メタデータ。**locale ごとに解決する**ので `generateMetadata`
 * （静的な `metadata` だと EN ページのタイトルにも `| いとぐち` が付き、既定 description も
 * 日本語のままになる）。
 */
export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = hasLocale(routing.locales, raw) ? raw : routing.defaultLocale;
  const [tSite, tFooter] = await Promise.all([
    getTranslations({ locale, namespace: 'Site' }),
    getTranslations({ locale, namespace: 'Footer' }),
  ]);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: tSite('title'),
      template: `%s | ${siteName(locale)}`,
    },
    description: tFooter('brandLead'),
    // 交渉期間中（preview）は全ページ noindex。本公開（public）で解除。
    ...(SITE_PHASE === 'preview' ? { robots: { index: false, follow: false } } : {}),
    ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
      ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
      : {}),
  };
}

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

  // サイト全体の JSON-LD（WebSite + Organization）。org 説明はフッターのリード文を流用。
  const t = await getTranslations({ locale, namespace: 'Footer' });

  return (
    <html lang={locale} className={fontVariables}>
      <body className="flex min-h-screen flex-col antialiased">
        <JsonLd data={[websiteJsonLd(locale), organizationJsonLd(locale, t('brandLead'))]} />
        <NextIntlClientProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
