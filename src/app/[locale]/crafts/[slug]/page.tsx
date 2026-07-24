import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { getCrafts, getCraftBySlug } from '@/lib/data';
import { craftNumberMap } from '@/lib/craftNumber';
import { JapaneseOnlyBanner } from '@/components/layout/JapaneseOnlyBanner';
import { CraftHero } from '@/components/crafts/CraftHero';
import { CraftExperienceCard } from '@/components/crafts/CraftExperienceCard';
import { CraftToc, type TocSection } from '@/components/crafts/CraftToc';
import { StepTimeline } from '@/components/crafts/StepTimeline';
import { ExperienceCard } from '@/components/experiences/ExperienceCard';
import { EventRow } from '@/components/events/EventRow';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { GoogleMapLink } from '@/components/map/GoogleMapLink';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { QuoteBox } from '@/components/ui/QuoteBox';
import { Reveal } from '@/components/ui/Reveal';

// 工芸詳細は ISR（CLAUDE.md の方針: revalidate=3600、未生成 slug はオンデマンド生成）
export const revalidate = 3600;
export const dynamicParams = true;

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// published の slug を静的生成（slug は locale 非依存。getCrafts は cache 済み）
export async function generateStaticParams() {
  const crafts = await getCrafts(routing.defaultLocale);
  return crafts.map((craft) => ({ slug: craft.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const craft = await getCraftBySlug(slug, locale);
  if (!craft) return {};
  return {
    title: craft.name,
    description: craft.tagline ?? craft.overview?.slice(0, 120) ?? undefined,
  };
}

/**
 * 工芸詳細（正本ページ・DESIGN.md §6）。
 * パンくず → 16:8 の Hero → 3 カラム（目次 240px / 本文 1fr / 追従サイドバー 300px）。
 *
 * 章見出しは 3 層（kicker / 日本語 / 英字サブ）。01・02 は DB（docs/18）、
 * 03 は工程数、04 は担い手名から組み立て、05 は固定文言（§6 章見出しの調達ルール）。
 */
export default async function CraftDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const [t, tCommon, tNav, craft, crafts] = await Promise.all([
    getTranslations('Crafts'),
    getTranslations('Common'),
    getTranslations('Nav'),
    getCraftBySlug(slug, locale as Locale),
    getCrafts(locale as Locale),
  ]);
  if (!craft) {
    notFound();
  }

  // 通し番号（`No. 01`）は工芸ごとに固定。ホーム・一覧と同じ番号を引く
  const index = craftNumberMap(crafts).get(craft.slug);
  const maker = craft.groups[0] ?? null;

  const has = {
    overview: Boolean(craft.overview),
    history: Boolean(craft.history),
    steps: craft.steps.length > 0,
    makers: craft.groups.length > 0,
    experience: craft.experiences.length > 0 || craft.upcomingEvents.length > 0,
    spots: craft.spots.length > 0,
    articles: craft.articles.length > 0,
    access: craft.groups.some((g) => g.address || g.contact || g.snsUrls.length > 0),
  };

  const sections: TocSection[] = (
    [
      ['overview', craft.aboutHeading ?? t('overview')],
      ['history', craft.storyHeading ?? t('history')],
      ['steps', t('steps')],
      ['makers', t('makers')],
      ['experience', t('experience')],
      ['spots', t('spots')],
      ['articles', t('articles')],
      ['access', t('access')],
    ] as const
  )
    .filter(([id]) => has[id])
    .map(([id, label]) => ({ id, label }));

  // 歴史・物語は最初の段落を引用ボックスに、残りを本文に流す（§6）
  const [historyLead, ...historyRest] = (craft.history ?? '').split(/\n{2,}/);

  const sidebar = (
    <CraftExperienceCard
      events={craft.upcomingEvents}
      experiences={craft.experiences}
      locale={locale as Locale}
      craftSlug={craft.slug}
    />
  );

  return (
    <>
      {/* EN 未訳（ja フォールバック）でこのページに来た場合のみバナー */}
      {locale === 'en' && craft.isFallback && <JapaneseOnlyBanner />}

      <div className="mx-auto max-w-content px-6 pt-5 md:px-8">
        <nav aria-label="breadcrumb" className="text-[12px] text-muted">
          <Link href="/" className="text-primary-600 hover:underline">
            {tNav('home')}
          </Link>
          <span className="mx-3 text-border-strong">/</span>
          <Link href="/crafts" className="text-primary-600 hover:underline">
            {t('listTitle')}
          </Link>
          <span className="mx-3 text-border-strong">/</span>
          <span>{craft.name}</span>
        </nav>
      </div>

      <div className="mx-auto mt-6 max-w-content px-6 md:px-8">
        <CraftHero craft={craft} index={index} />
      </div>

      <div className="mx-auto mt-14 max-w-content px-6 pb-section-sm md:px-8 md:pb-section">
        <div className="lg:grid lg:grid-cols-[240px_1fr_300px] lg:gap-[60px]">
          {/* 目次: PC は sticky 追従 / SP は上部の横スクロールチップ */}
          <aside className="mb-10 lg:mb-0">
            <div className="lg:sticky lg:top-[100px]">
              <CraftToc sections={sections} ariaLabel={t('toc')} heading={t('contents')} />
            </div>
          </aside>

          <div className="min-w-0">
            {has.overview && (
              <section id="overview" className="mb-16 scroll-mt-28 md:mb-20">
                <SectionHeading
                  kicker={t('chapter01')}
                  title={craft.aboutHeading ?? t('overview')}
                  en={craft.aboutHeadingEn ?? undefined}
                />
                <p className="max-w-[62ch] font-display text-lead text-primary-700">
                  {craft.overview}
                </p>
              </section>
            )}

            {has.history && (
              <section id="history" className="mb-16 scroll-mt-28 md:mb-20">
                <SectionHeading
                  kicker={t('chapter02')}
                  title={craft.storyHeading ?? t('history')}
                  en={craft.storyHeadingEn ?? undefined}
                />
                <QuoteBox>{historyLead}</QuoteBox>
                {historyRest.length > 0 && (
                  <div className="mt-6 max-w-[62ch] space-y-4 text-body leading-[1.95]">
                    {historyRest.map((paragraph) => (
                      <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                    ))}
                  </div>
                )}
              </section>
            )}

            {has.steps && (
              <section id="steps" className="mb-16 scroll-mt-28 md:mb-20">
                <SectionHeading
                  kicker={t('chapter03')}
                  title={t('stepsHeading')}
                  en={t('stepsEn', { count: craft.steps.length })}
                />
                <StepTimeline steps={craft.steps} />
              </section>
            )}

            {has.makers && (
              <section id="makers" className="mb-16 scroll-mt-28 md:mb-20">
                <SectionHeading
                  kicker={t('chapter04')}
                  title={
                    maker ? t('makersHeading', { name: maker.name }) : t('makersHeadingFallback')
                  }
                  en={maker?.nameEn ?? undefined}
                />
                <div className="grid gap-5">
                  {craft.groups.map((g) => (
                    <div
                      key={g.id}
                      className="grid gap-6 rounded-lg border border-border bg-surface p-6 md:grid-cols-[200px_1fr] md:items-center md:p-8"
                    >
                      <div className="flex aspect-square items-center justify-center rounded-md border border-dashed border-border-strong bg-warm p-4 text-center text-caption text-muted">
                        {tCommon('photoPending')}
                      </div>
                      <div>
                        <h3 className="font-display text-h3">{g.name}</h3>
                        {g.nameEn && (
                          <p className="mt-1 font-en text-[14px] italic text-primary-600 [font-synthesis:none]">
                            {g.nameEn}
                          </p>
                        )}
                        {g.description && (
                          <p className="mt-3 text-body leading-[1.9] text-muted">
                            {g.description}
                          </p>
                        )}
                        {g.isProvisional && (
                          <p className="mt-2 text-caption text-muted">
                            {tCommon('provisional')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 体験する: ページ内で最も強い。淡藤の面で区切る（§6） */}
            {has.experience && (
              <section id="experience" className="mb-16 scroll-mt-28 md:mb-20">
                <div className="rounded-lg bg-primary-100 p-6 md:p-8">
                  <h2 className="font-display text-h2">{t('experience')}</h2>
                  <p className="mt-2 text-body text-muted">{t('experienceLead')}</p>

                  {/* SP では追従サイドバーを出せないので、ここにインライン展開する（§8）。
                      PC 側とは display で排他になるため、同時に見えることはない。 */}
                  <div className="mt-6 lg:hidden">{sidebar}</div>

                  {craft.experiences.length > 0 && (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      {craft.experiences.map((exp) => (
                        <ExperienceCard
                          key={exp.id}
                          experience={exp}
                          className="bg-surface"
                        />
                      ))}
                    </div>
                  )}

                  {craft.upcomingEvents.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-display text-h3">{t('upcomingEvents')}</h3>
                      <ul className="mt-3 flex flex-col gap-3">
                        {craft.upcomingEvents.map((ev) => (
                          <li key={ev.id}>
                            <EventRow event={ev} locale={locale as Locale} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {has.spots && (
              <section id="spots" className="mb-16 scroll-mt-28 md:mb-20">
                <SectionHeading
                  kicker={t('chapter05')}
                  title={t('spotsHeading')}
                  en={t('spotsEn')}
                />
                <ul className="grid gap-5 sm:grid-cols-2">
                  {craft.spots.map((sp) => (
                    <li
                      key={sp.id}
                      className="rounded-md border border-border bg-surface p-6"
                    >
                      <p className="font-en text-[11px] uppercase italic tracking-[0.12em] text-gold-800 [font-synthesis:none]">
                        ◈ {t(`spotType_${sp.type}`)}
                      </p>
                      {sp.name && <h3 className="mt-2 font-display text-h4">{sp.name}</h3>}
                      {sp.description && (
                        <p className="mt-2 text-caption leading-[1.7] text-muted">
                          {sp.description}
                        </p>
                      )}
                      <GoogleMapLink
                        className="mt-3"
                        name={sp.name}
                        address={sp.address}
                        lat={sp.lat}
                        lng={sp.lng}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {has.articles && (
              <section id="articles" className="mb-16 scroll-mt-28 md:mb-20">
                <SectionHeading title={t('articles')} />
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  {craft.articles.map((a, i) => (
                    <Reveal key={a.id} index={i}>
                      <ArticleCard article={a} locale={locale as Locale} />
                    </Reveal>
                  ))}
                </div>
              </section>
            )}

            {has.access && (
              <section id="access" className="mb-16 scroll-mt-28 md:mb-20">
                <SectionHeading title={t('access')} />
                <div className="space-y-4">
                  {craft.groups
                    .filter((g) => g.address || g.contact || g.snsUrls.length > 0)
                    .map((g) => (
                      <div key={g.id} className="rounded-lg border border-border p-5">
                        <h3 className="font-display text-h3">{g.name}</h3>
                        {g.address && (
                          <div className="mt-3">
                            <p className="text-caption text-muted">{t('addressLabel')}</p>
                            <GoogleMapLink
                              name={g.name}
                              address={g.address}
                              lat={g.lat}
                              lng={g.lng}
                            />
                          </div>
                        )}
                        {g.contact && (
                          <div className="mt-3">
                            <p className="text-caption text-muted">{t('contactLabel')}</p>
                            <p className="text-body">{g.contact}</p>
                          </div>
                        )}
                        {g.snsUrls.length > 0 && (
                          <div className="mt-3">
                            <p className="text-caption text-muted">{t('snsLabel')}</p>
                            <ul className="mt-1 flex flex-wrap gap-3">
                              {g.snsUrls.map((url) => (
                                <li key={url}>
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-caption text-accent-600 hover:underline"
                                  >
                                    {url}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </section>
            )}

            <Link href="/crafts" className="text-caption text-primary-700 hover:underline">
              ← {tCommon('backToList')}
            </Link>
          </div>

          {/* 追従サイドバー: いつでも申し込める入口（§5.12）。SP では上の体験セクションに出す */}
          <aside className="hidden lg:block">
            <div className="lg:sticky lg:top-[100px]">{sidebar}</div>
          </aside>
        </div>
      </div>
    </>
  );
}
