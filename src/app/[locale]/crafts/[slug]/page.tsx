import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { getCrafts, getCraftBySlug } from '@/lib/data';
import { JapaneseOnlyBanner } from '@/components/layout/JapaneseOnlyBanner';
import { CraftToc, type TocSection } from '@/components/crafts/CraftToc';
import { StepTimeline } from '@/components/crafts/StepTimeline';
import { ExperienceCard } from '@/components/experiences/ExperienceCard';
import { EventRow } from '@/components/events/EventRow';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { GoogleMapLink } from '@/components/map/GoogleMapLink';
import { Card } from '@/components/ui/Card';
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

export default async function CraftDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const [t, tCommon, craft] = await Promise.all([
    getTranslations('Crafts'),
    getTranslations('Common'),
    getCraftBySlug(slug, locale as Locale),
  ]);
  if (!craft) {
    notFound();
  }

  // どのセクションを表示するか（データがある節だけ）
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
      ['overview', t('overview')],
      ['history', t('history')],
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

  return (
    <>
      {/* EN 未訳（ja フォールバック）でこのページに来た場合のみバナー */}
      {locale === 'en' && craft.isFallback && <JapaneseOnlyBanner />}

      {/* Hero（全幅）。写真許可前は淡藤バンド、写真ありは白文字＋下部スクリム */}
      <section id="hero" className="scroll-mt-24">
        {craft.heroImageUrl ? (
          <div className="relative max-h-[70vh] w-full overflow-hidden" style={{ aspectRatio: '16 / 9' }}>
            <Image
              src={craft.heroImageUrl}
              alt={craft.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 mx-auto max-w-content px-6 pb-8">
              {craft.region && (
                <p className="text-caption text-white/80">📍 {craft.region}</p>
              )}
              <h1 className="mt-1 font-display text-display text-white">{craft.name}</h1>
              {craft.tagline && (
                <p className="mt-2 text-body-lg text-white/90">{craft.tagline}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-primary-100">
            <div className="mx-auto max-w-content px-6 py-section-sm md:py-section">
              {craft.region && (
                <p className="text-caption font-medium text-primary-700">📍 {craft.region}</p>
              )}
              <h1 className="mt-2 font-display text-display">{craft.name}</h1>
              {craft.tagline && (
                <p className="mt-3 max-w-reading text-body-lg text-muted">{craft.tagline}</p>
              )}
              {craft.isProvisional && (
                <p className="mt-3 text-caption text-muted">{tCommon('provisional')}</p>
              )}
            </div>
          </div>
        )}
      </section>

      <div className="mx-auto max-w-content px-6 py-section-sm md:py-section">
        <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-10">
          {/* 目次: PC は sticky 追従 / SP は上部横スクロールチップ */}
          <aside className="mb-8 lg:mb-0">
            <div className="lg:sticky lg:top-24">
              <CraftToc sections={sections} ariaLabel={t('toc')} />
            </div>
          </aside>

          {/* 本文 */}
          <div className="min-w-0 space-y-12 md:space-y-16">
            {has.overview && (
              <section id="overview" className="scroll-mt-24">
                <h2 className="text-h2">{t('overview')}</h2>
                <p className="mt-4 max-w-reading text-body-lg">{craft.overview}</p>
              </section>
            )}

            {has.history && (
              <section id="history" className="scroll-mt-24">
                <h2 className="text-h2">{t('history')}</h2>
                <p className="mt-4 max-w-reading whitespace-pre-line text-body-lg">
                  {craft.history}
                </p>
              </section>
            )}

            {has.steps && (
              <section id="steps" className="scroll-mt-24">
                <h2 className="text-h2">{t('steps')}</h2>
                <div className="mt-6">
                  <StepTimeline steps={craft.steps} />
                </div>
              </section>
            )}

            {has.makers && (
              <section id="makers" className="scroll-mt-24">
                <h2 className="text-h2">{t('makers')}</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {craft.groups.map((g) => (
                    <Card key={g.id} className="p-5">
                      <h3 className="text-h3">{g.name}</h3>
                      {g.description && (
                        <p className="mt-2 text-body text-muted">{g.description}</p>
                      )}
                      {g.isProvisional && (
                        <p className="mt-2 text-caption text-muted">{tCommon('provisional')}</p>
                      )}
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* 体験する: ページ内で最も強い。淡藤の面で区切る（DESIGN §6） */}
            {has.experience && (
              <section id="experience" className="scroll-mt-24">
                <div className="rounded-lg bg-primary-100 p-6 md:p-8">
                  <h2 className="text-h2">{t('experience')}</h2>
                  <p className="mt-2 text-body text-muted">{t('experienceLead')}</p>

                  {craft.experiences.length > 0 && (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      {craft.experiences.map((exp) => (
                        <ExperienceCard key={exp.id} experience={exp} />
                      ))}
                    </div>
                  )}

                  {craft.upcomingEvents.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-h3">{t('upcomingEvents')}</h3>
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
              <section id="spots" className="scroll-mt-24">
                <h2 className="text-h2">{t('spots')}</h2>
                <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                  {craft.spots.map((sp) => (
                    <li key={sp.id}>
                      <Card className="p-5">
                        {sp.name && <h3 className="text-h3">{sp.name}</h3>}
                        {sp.description && (
                          <p className="mt-2 text-body text-muted">{sp.description}</p>
                        )}
                        <GoogleMapLink
                          className="mt-3"
                          name={sp.name}
                          address={sp.address}
                          lat={sp.lat}
                          lng={sp.lng}
                        />
                      </Card>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {has.articles && (
              <section id="articles" className="scroll-mt-24">
                <h2 className="text-h2">{t('articles')}</h2>
                <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {craft.articles.map((a, i) => (
                    <Reveal key={a.id} index={i}>
                      <ArticleCard article={a} locale={locale as Locale} />
                    </Reveal>
                  ))}
                </div>
              </section>
            )}

            {has.access && (
              <section id="access" className="scroll-mt-24">
                <h2 className="text-h2">{t('access')}</h2>
                <div className="mt-4 space-y-4">
                  {craft.groups
                    .filter((g) => g.address || g.contact || g.snsUrls.length > 0)
                    .map((g) => (
                      <div key={g.id} className="rounded-lg border border-border p-5">
                        <h3 className="text-h3">{g.name}</h3>
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

            <div className="pt-4">
              <Link href="/crafts" className="text-caption text-primary-700 hover:underline">
                ← {tCommon('backToList')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
