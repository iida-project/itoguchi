import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Band } from '@/components/layout/Band';
import { PageHero } from '@/components/layout/PageHero';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { LinkButton } from '@/components/ui/LinkButton';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'About' });
  return { title: t('title'), description: t('intro') };
}

/**
 * About（DESIGN.md §6「一覧ページ・外挿ルール」= 読み物レイアウト + 面 2・面 3 を織り交ぜる）。
 * 面の順序は 1（Hero）→ 3（ミッション）→ 1（案内係）→ 2（Sayo's Journal）→ 3（運営・問い合わせ）→ 4。
 *
 * **`#operator` / `#contact` はフッター（§5.13）のリンク先**なので必ず残す。
 */
export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations('About');

  return (
    <>
      {/* 面 1: Hero */}
      <Band padding="none">
        <div className="py-14 md:py-20">
          <PageHero
            kicker={t('heroKicker')}
            title={t.rich('heroHeading', {
              br: () => <br />,
              em: (chunks) => <em className="mark-gold not-italic">{chunks}</em>,
            })}
            en={t('heroEn')}
          />
          <p className="mt-8 max-w-reading text-body-lg">{t('intro')}</p>
        </div>
      </Band>

      {/* 面 3: ミッション「点を、線に。」 */}
      <Band tone="surface" padding="block" bordered>
        <SectionHeading
          kicker={t('chapter01')}
          title={t('purposeTitle')}
          en={t('chapter01En')}
        />
        <p className="max-w-reading text-body-lg">{t('purposeBody')}</p>
      </Band>

      {/* 面 1: 体験への案内係 */}
      <Band>
        <SectionHeading
          kicker={t('chapter02')}
          title={t('guideTitle')}
          en={t('chapter02En')}
        />
        <p className="max-w-reading text-body-lg">{t('guideBody')}</p>
        <div className="mt-8 flex flex-wrap gap-3.5">
          <LinkButton href="/experiences" size="lg">
            {t('ctaExperiences')} →
          </LinkButton>
          <LinkButton href="/events" variant="secondary" size="lg">
            {t('ctaEvents')}
          </LinkButton>
        </div>
      </Band>

      {/* 面 2: Sayo's Journal との関係 */}
      <Band tone="warm" padding="block">
        <SectionHeading
          kicker={t('chapter03')}
          title={t('sayoTitle')}
          en={t('chapter03En')}
        />
        <p className="max-w-reading text-body-lg">{t('sayoBody')}</p>
      </Band>

      {/* 面 3: 運営・お問い合わせ（フッターのアンカー着地点） */}
      <Band tone="surface" padding="block" bordered>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <section id="operator" className="scroll-mt-28">
            <SectionHeading
              kicker={t('chapter04')}
              title={t('operatorTitle')}
              en={t('chapter04En')}
              as="h2"
            />
            <p className="text-body-lg">{t('operatorBody')}</p>
          </section>

          <section id="contact" className="scroll-mt-28">
            <SectionHeading
              kicker={t('chapter05')}
              title={t('contactTitle')}
              en={t('chapter05En')}
              as="h2"
            />
            <p className="text-body-lg">{t('contactBody')}</p>
          </section>
        </div>
      </Band>
    </>
  );
}
