import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { getHomeData } from '@/lib/data';
import { craftNumberMap } from '@/lib/craftNumber';
import { Band } from '@/components/layout/Band';
import { CardMedia } from '@/components/ui/Card';
import { Kicker, SectionHeading } from '@/components/ui/SectionHeading';
import { LinkButton } from '@/components/ui/LinkButton';
import { Stat } from '@/components/ui/Stat';
import { Reveal } from '@/components/ui/Reveal';
import { ThreadFlow } from '@/components/home/ThreadFlow';
import { EventRow } from '@/components/events/EventRow';
import { CraftCard } from '@/components/crafts/CraftCard';
import { ArticleCard } from '@/components/articles/ArticleCard';

// 公開ページは ISR。ホームは日次更新で十分（REQUIREMENTS.md §8）
export const revalidate = 86400;

type Props = {
  params: Promise<{ locale: string }>;
};

/**
 * ホーム（DESIGN.md §6）。面の順序は 1 → 1 → 1 → 2 → 3 → 1 → 4（フッター）。
 * 生成り一色で最後まで行かないよう、工芸グリッドを面 2、ミッションを面 3 で敷く。
 */
export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const [t, tCommon, home] = await Promise.all([
    getTranslations('Home'),
    getTranslations('Common'),
    getHomeData(locale as Locale),
  ]);
  const { upcomingEvents, crafts, latestArticles, stats } = home;

  const craftById = new Map(crafts.map((c) => [c.id, c]));
  // 通し番号は工芸ごとに固定（一覧・詳細と同じ番号になる）
  const craftNumbers = craftNumberMap(crafts);
  const seeAll = (href: string) => (
    <Link
      href={href}
      className="text-[14px] font-medium text-primary-600 underline-offset-4 hover:underline"
    >
      {tCommon('seeAll')} →
    </Link>
  );

  return (
    <>
      {/* 1. Hero（面 1・2 カラム） */}
      <Band padding="none">
        <div className="grid items-center gap-10 py-14 md:py-20 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
          {/* SP は写真を先に置き、その下にコピー（DESIGN §8） */}
          <div className="order-2 min-w-0 lg:order-1">
            <Kicker tone="primary" rule={40} className="mb-5">
              {t('heroKicker')}
            </Kicker>
            <h1 className="font-display text-display">
              {t.rich('heroTitle', {
                // 和文は任意の位置で折り返るため、改行位置を文言側で決める（ICU では <br></br>）
                br: () => <br />,
                em: (chunks) => (
                  // 強調語は藤紫 + 金の下線（§6 ホーム #1）
                  <em className="relative not-italic text-primary-600 after:absolute after:inset-x-0 after:-bottom-1 after:h-[3px] after:rounded-sm after:bg-gold-600">
                    {chunks}
                  </em>
                ),
              })}
            </h1>
            {locale !== 'en' && (
              <p className="mt-6 font-en text-[26px] italic leading-snug text-muted [font-synthesis:none]">
                {t('heroEn')}
              </p>
            )}
            <p className="mt-8 max-w-[480px] text-body">{t('heroLead')}</p>
            <div className="mt-10 flex flex-wrap gap-3.5">
              <LinkButton href="/experiences" size="lg">
                {t('ctaExperiences')} →
              </LinkButton>
              <LinkButton href="/crafts" variant="secondary" size="lg">
                {t('ctaCrafts')}
              </LinkButton>
            </div>
          </div>

          {/* 写真は docs/15 まで入らない。4:5 の枠だけ先に確定させる（§9） */}
          <div className="relative order-1 lg:order-2">
            <CardMedia
              src={null}
              aspectClassName="aspect-[4/5]"
              className="rounded-lg shadow-deep"
              placeholderLabel="Photo"
              placeholderNote={t('heroPhotoCaption')}
            />
          </div>
        </div>
      </Band>

      {/* 2. スタッツ帯（面 1・上に 1px ボーダー） */}
      <Band padding="none">
        <div className="border-t border-border py-10">
          <Stat
            items={[
              { value: stats.crafts, unit: t('statCraftsUnit'), label: t('statCrafts') },
              {
                value: stats.experiences,
                unit: t('statExperiencesUnit'),
                label: t('statExperiences'),
              },
              { value: stats.makers, unit: t('statMakersUnit'), label: t('statMakers') },
              { value: 'JA / EN', label: t('statLanguages') },
            ]}
          />
        </div>
      </Band>

      {/* 3. 直近の体験・イベント（面 1） */}
      <Band>
        <SectionHeading
          kicker={t('upcomingKicker')}
          title={t('upcomingHeading')}
          en={t('upcomingEn')}
          action={seeAll('/events')}
        />
        {upcomingEvents.length > 0 ? (
          <ul className="flex flex-col gap-4">
            {upcomingEvents.map((event, i) => (
              <li key={event.id}>
                <Reveal index={i}>
                  <EventRow event={event} locale={locale as Locale} />
                </Reveal>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-body text-muted">
            {t('noUpcoming')}{' '}
            <Link href="/experiences" className="text-primary-700 underline">
              {t('ctaExperiences')}
            </Link>
          </p>
        )}
      </Band>

      {/* 4. 工芸グリッド（面 2・全幅の bg-warm） */}
      <Band tone="warm" padding="block">
        <SectionHeading
          kicker={t('craftsKicker')}
          title={t('craftsTitle')}
          en={t('craftsEn')}
          action={seeAll('/crafts')}
        />
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {crafts.map((craft, i) => (
            <Reveal key={craft.id} index={i}>
              <CraftCard craft={craft} index={craftNumbers.get(craft.slug)} />
            </Reveal>
          ))}
        </div>
      </Band>

      {/* 5. ミッション「点を、線に。」（面 3・全幅の白ブロック） */}
      <Band tone="surface" padding="block" bordered>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-20">
          <div>
            <Kicker className="mb-3">{t('purposeKicker')}</Kicker>
            <h2 className="font-display text-h1">{t('purposeTitle')}</h2>
            {locale !== 'en' && (
              <p className="mt-3 font-en text-h4 italic text-muted [font-synthesis:none]">
                {t('purposeEn')}
              </p>
            )}
            <p className="mt-6 max-w-reading text-body">{t('purposeLead')}</p>
          </div>
          <ThreadFlow
            nodes={[
              { label: t('flow1') },
              { label: t('flow2') },
              { label: t('flow3'), emphasis: true },
              { label: t('flow4') },
              { label: t('flow5') },
            ]}
          />
        </div>
      </Band>

      {/* 6. 最新記事（面 1） */}
      {latestArticles.length > 0 && (
        <Band>
          <SectionHeading
            kicker={t('articlesKicker')}
            title={t('articlesTitle')}
            en={t('articlesEn')}
            action={seeAll('/articles')}
          />
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {latestArticles.map((article, i) => {
              const craft = article.craftId ? craftById.get(article.craftId) : null;
              return (
                <Reveal key={article.id} index={i}>
                  <ArticleCard
                    article={article}
                    locale={locale as Locale}
                    craft={craft ? { name: craft.name, nameLatin: craft.nameLatin } : null}
                  />
                </Reveal>
              );
            })}
          </div>
        </Band>
      )}
    </>
  );
}
