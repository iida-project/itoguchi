import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Band } from '@/components/layout/Band';
import { Kicker } from '@/components/ui/SectionHeading';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'Privacy' });
  return { title: t('title'), description: t('intro') };
}

/**
 * プライバシーポリシー（DESIGN.md §6「Privacy は面 1」）。
 *
 * ここだけは面を織り交ぜず**面 1 のみ**で通す（§4.2 の「1 ページで最低 3 種類」より、
 * §6 の個別指定「装飾は最小限・読みやすさ優先」を優先する）。同じ理由で条項見出しには
 * `SectionHeading`（40px の 3 層見出し）を使わず、明朝の `h3` サイズに留める。
 */
export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations('Privacy');

  const sections = [
    { title: t('collectTitle'), body: t('collectBody') },
    { title: t('cookieTitle'), body: t('cookieBody') },
    { title: t('analyticsTitle'), body: t('analyticsBody') },
    { title: t('externalTitle'), body: t('externalBody') },
    { title: t('contactTitle'), body: t('contactBody') },
    { title: t('updatesTitle'), body: t('updatesBody') },
  ];

  return (
    <Band width="reading" padding="none">
      <div className="py-14 md:py-20">
        <Kicker rule={40} className="mb-5">
          {t('heroKicker')}
        </Kicker>
        {/* 読み物幅（720px）に display 74px を置くと「プライバシーポリ／シー」のように
            カタカナ語の途中で折り返る。ここは h1 44px に留める（装飾は最小限・§6） */}
        <h1 className="font-display text-h1">{t('title')}</h1>
        {locale !== 'en' && (
          <p className="mt-4 font-en text-[20px] italic leading-snug tracking-[0.04em] text-muted [font-synthesis:none]">
            {t('heroEn')}
          </p>
        )}
        <p className="mt-8 text-body-lg text-muted">{t('intro')}</p>

        <div className="mt-14">
          {sections.map((section) => (
            <section key={section.title} className="border-t border-border py-8">
              <h2 className="font-display text-h3">{section.title}</h2>
              <p className="mt-3 text-body-lg">{section.body}</p>
            </section>
          ))}
        </div>

        <p className="mt-6 text-caption text-muted">{t('note')}</p>
      </div>
    </Band>
  );
}
