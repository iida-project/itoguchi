import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { getHomeData } from '@/lib/data';
import { LinkButton } from '@/components/ui/LinkButton';
import { ThreadDivider } from '@/components/ui/ThreadDivider';
import { Reveal } from '@/components/ui/Reveal';
import { EventRow } from '@/components/events/EventRow';
import { CraftCard } from '@/components/crafts/CraftCard';
import { ArticleCard } from '@/components/articles/ArticleCard';

// 公開ページは ISR。ホームは日次更新で十分（REQUIREMENTS.md §8）
export const revalidate = 86400;

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const [t, tCommon, { upcomingEvents, crafts, latestArticles }] = await Promise.all([
    getTranslations('Home'),
    getTranslations('Common'),
    getHomeData(locale as Locale),
  ]);

  return (
    <>
      {/* 1. Hero（全幅）。写真許可前は淡藤のプレースホルダ帯（将来は背景写真＋スクリムに差し替え） */}
      <section className="bg-primary-100">
        <div className="mx-auto flex max-w-content flex-col items-center px-6 py-section-sm text-center md:py-section">
          <h1 className="font-display text-display">{t('heroTitle')}</h1>
          <p className="mt-4 max-w-reading text-body-lg text-muted">{t('heroLead')}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <LinkButton href="/experiences" variant="primary">
              {t('ctaExperiences')}
            </LinkButton>
            <LinkButton href="/crafts" variant="secondary">
              {t('ctaCrafts')}
            </LinkButton>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-content px-6 py-section-sm md:py-section">
        {/* 2. 直近の体験・イベント */}
        <section>
          <SectionHeading title={t('upcomingTitle')} seeAllHref="/events" seeAllLabel={tCommon('seeAll')} />
          {upcomingEvents.length > 0 ? (
            <ul className="mt-6 flex flex-col gap-4">
              {upcomingEvents.map((event, i) => (
                <li key={event.id}>
                  <Reveal index={i}>
                    <EventRow event={event} locale={locale as Locale} />
                  </Reveal>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-6 text-body text-muted">
              {t('noUpcoming')}{' '}
              <Link href="/experiences" className="text-primary-700 underline">
                {t('ctaExperiences')}
              </Link>
            </p>
          )}
        </section>

        <ThreadDivider className="my-section-sm md:my-section" />

        {/* 3. 工芸カードグリッド（今後増える前提のグリッド） */}
        <section>
          <SectionHeading title={t('craftsTitle')} seeAllHref="/crafts" seeAllLabel={tCommon('seeAll')} />
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {crafts.map((craft, i) => (
              <Reveal key={craft.id} index={i}>
                <CraftCard craft={craft} />
              </Reveal>
            ))}
          </div>
        </section>

        <ThreadDivider className="my-section-sm md:my-section" />

        {/* 4. サイトの目的「点を線に」を糸モチーフで説明 */}
        <section className="text-center">
          <h2 className="text-h2">{t('purposeTitle')}</h2>
          <p className="mx-auto mt-3 max-w-reading text-body text-muted">{t('purposeLead')}</p>
          <ol className="relative mx-auto mt-8 max-w-reading text-left">
            {/* 縦の糸（§5.5 の工程タイムラインと同じモチーフ） */}
            <span
              aria-hidden="true"
              className="absolute bottom-3 left-[7px] top-3 w-px bg-primary-400"
            />
            {[t('purpose1'), t('purpose2'), t('purpose3')].map((label, i) => (
              <li key={i} className="relative flex items-center gap-4 py-3">
                {/* 結び目 */}
                <span
                  aria-hidden="true"
                  className="relative z-10 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-primary-400 bg-primary-600"
                />
                <p className="text-body-lg">{label}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 5. 最新記事（記事が存在するときのみ表示） */}
        {latestArticles.length > 0 && (
          <>
            <ThreadDivider className="my-section-sm md:my-section" />
            <section>
              <SectionHeading title={t('articlesTitle')} seeAllHref="/articles" seeAllLabel={tCommon('seeAll')} />
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {latestArticles.map((article, i) => (
                  <Reveal key={article.id} index={i}>
                    <ArticleCard article={article} locale={locale as Locale} />
                  </Reveal>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}

type SectionHeadingProps = {
  title: string;
  seeAllHref: string;
  seeAllLabel: string;
};

// セクション見出し＋「すべて見る」リンク（ホーム内で共通）
function SectionHeading({ title, seeAllHref, seeAllLabel }: SectionHeadingProps) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="text-h2">{title}</h2>
      <Link
        href={seeAllHref}
        className="shrink-0 text-caption text-primary-700 hover:underline"
      >
        {seeAllLabel} →
      </Link>
    </div>
  );
}
