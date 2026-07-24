import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { getExperiences, getSiteStats } from '@/lib/data';
import type { Availability } from '@/lib/data/types';
import { Band } from '@/components/layout/Band';
import { PageHero } from '@/components/layout/PageHero';
import { ExperienceCard } from '@/components/experiences/ExperienceCard';
import {
  ExperienceFilterList,
  type ExperienceFilterItem,
} from '@/components/experiences/ExperienceFilterList';
import { LinkButton } from '@/components/ui/LinkButton';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Stat } from '@/components/ui/Stat';

// 体験一覧は ISR（searchParams はサーバーで読まず、フィルタはクライアント側＝静的維持）
export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'Experiences' });
  return { title: t('title'), description: t('lead') };
}

/**
 * 体験一覧（DESIGN.md §6「一覧ページ・外挿ルール」）。
 * 面の順序は 1（Hero）→ 1（絞り込み + グリッド）→ 2（締めの帯）→ 4（フッター）。
 *
 * 借りている型: カレンダーのサイドバー「随時受付カード」（淡藤の `ExperienceCard`）を
 * そのまま 3 列グリッドに拡大したもの。**カードは両画面で同一の部品**。
 */
export default async function ExperiencesPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const [t, tCommon, experiences, stats] = await Promise.all([
    getTranslations('Experiences'),
    getTranslations('Common'),
    getExperiences(locale as Locale),
    getSiteStats(locale as Locale),
  ]);

  // フィルタ選択肢を全件から導出
  const craftsMap = new Map<string, string>();
  const regionsSet = new Set<string>();
  const availabilitySet = new Set<Availability>();
  for (const exp of experiences) {
    if (exp.craft) craftsMap.set(exp.craft.slug, exp.craft.name);
    if (exp.craft?.region) regionsSet.add(exp.craft.region);
    availabilitySet.add(exp.availability);
  }
  const crafts = [...craftsMap].map(([slug, name]) => ({ slug, name }));
  const regions = [...regionsSet];
  const availabilities = [...availabilitySet];

  // カードはサーバーで確定。フィルタ用メタと一緒に渡す
  const items: ExperienceFilterItem[] = experiences.map((exp) => ({
    id: exp.id,
    craftSlug: exp.craft?.slug ?? null,
    region: exp.craft?.region ?? null,
    availability: exp.availability,
    node: <ExperienceCard experience={exp} craft={exp.craft} />,
  }));

  return (
    <>
      {/* 面 1: Hero + スタッツ帯 */}
      <Band padding="none">
        <div className="pt-14 md:pt-20">
          <PageHero
            kicker={t('heroKicker')}
            title={t.rich('heroHeading', {
              br: () => <br />,
              em: (chunks) => <em className="mark-gold not-italic">{chunks}</em>,
            })}
            en={t('heroEn')}
          />
          <p className="mt-8 max-w-reading text-body-lg text-muted">{t('lead')}</p>
          <div className="mt-12 border-t border-border py-8">
            <Stat
              items={[
                { value: stats.experiences, label: tCommon('statExperiences') },
                { value: stats.crafts, label: tCommon('statCrafts') },
                { value: stats.makers, label: tCommon('statMakers') },
              ]}
            />
          </div>
        </div>
      </Band>

      {/* 面 1: 絞り込み + グリッド（useSearchParams のため Suspense で包む＝SSG 維持） */}
      <Band padding="none">
        <div className="pb-section-sm pt-8 md:pb-section md:pt-12">
          {/* Hero の h1 とカードの h3 のあいだを埋める見出し（見出しレベルを飛ばさない）。
              視覚的には Hero と重複するので読み上げ・アウトライン専用 */}
          <h2 className="sr-only">{t('title')}</h2>
          <Suspense fallback={<FallbackGrid items={items} />}>
            <ExperienceFilterList
              items={items}
              crafts={crafts}
              regions={regions}
              availabilities={availabilities}
            />
          </Suspense>
        </div>
      </Band>

      {/* 面 2: 締めの帯（日付の決まった催しへ渡す） */}
      <Band tone="warm" padding="block">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <SectionHeading
              kicker={t('outroKicker')}
              title={t('outroTitle')}
              en={t('outroEn')}
              className="mb-4"
            />
            <p className="max-w-reading text-body text-muted">{t('outroLead')}</p>
          </div>
          <div className="flex flex-wrap gap-3.5">
            <LinkButton href="/events" size="lg">
              {t('outroCtaEvents')} →
            </LinkButton>
            <LinkButton href="/crafts" variant="secondary" size="lg">
              {t('browseCrafts')}
            </LinkButton>
          </div>
        </div>
      </Band>
    </>
  );
}

// Suspense fallback（＝プリレンダリング時の内容）。全カードを出して SEO/初期表示を確保
function FallbackGrid({ items }: { items: ExperienceFilterItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <div key={it.id}>{it.node}</div>
      ))}
    </div>
  );
}
