import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { getArticles, getCrafts, getSiteStats } from '@/lib/data';
import { Band } from '@/components/layout/Band';
import { PageHero } from '@/components/layout/PageHero';
import { ArticleCard } from '@/components/articles/ArticleCard';
import {
  ArticleFilterList,
  type ArticleFilterItem,
} from '@/components/articles/ArticleFilterList';
import { LinkButton } from '@/components/ui/LinkButton';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Stat } from '@/components/ui/Stat';

export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'Articles' });
  return { title: t('listTitle'), description: t('lead') };
}

/**
 * 記事一覧（DESIGN.md §6「一覧ページ・外挿ルール」）。
 * 面の順序は 1（Hero）→ 1（絞り込み + グリッド）→ 2（締めの帯）→ 4（フッター）。
 *
 * 借りている型: ホーム #6 の記事カード（16:10・英字イタリックのタグ）を 3 列グリッドに拡大。
 */
export default async function ArticlesPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const [t, tCommon, articles, crafts, stats] = await Promise.all([
    getTranslations('Articles'),
    getTranslations('Common'),
    getArticles(locale as Locale),
    getCrafts(locale as Locale),
    getSiteStats(locale as Locale),
  ]);

  const craftById = new Map(
    crafts.map((c) => [c.id, { slug: c.slug, name: c.name, nameLatin: c.nameLatin }]),
  );

  const items: ArticleFilterItem[] = articles.map((article) => {
    const craft = article.craftId ? (craftById.get(article.craftId) ?? null) : null;
    return {
      id: article.id,
      craftSlug: craft?.slug ?? null,
      node: <ArticleCard article={article} locale={locale as Locale} craft={craft} />,
    };
  });

  // 記事を持つ工芸だけをチップに
  const articleCraftSlugs = new Set(items.map((it) => it.craftSlug).filter(Boolean));
  const filterCrafts = crafts
    .filter((c) => articleCraftSlugs.has(c.slug))
    .map((c) => ({ slug: c.slug, name: c.name }));

  return (
    <>
      {/* 面 1: Hero + スタッツ帯 */}
      <Band padding="none">
        <div className="pt-14 md:pt-20">
          <PageHero
            kicker={t('listKicker')}
            title={t.rich('listHeading', {
              br: () => <br />,
              em: (chunks) => <em className="mark-gold not-italic">{chunks}</em>,
            })}
            en={t('listEn')}
          />
          <p className="mt-8 max-w-reading text-body-lg text-muted">{t('lead')}</p>
          <div className="mt-12 border-t border-border py-8">
            <Stat
              items={[
                { value: stats.articles, label: tCommon('statArticles') },
                { value: stats.crafts, label: tCommon('statCrafts') },
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
          <h2 className="sr-only">{t('listTitle')}</h2>
          <Suspense fallback={<FallbackGrid items={items} />}>
            <ArticleFilterList items={items} crafts={filterCrafts} />
          </Suspense>
        </div>
      </Band>

      {/* 面 2: 締めの帯（記事から工芸・体験へ渡す） */}
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
            <LinkButton href="/crafts" size="lg">
              {t('browseCrafts')} →
            </LinkButton>
            <LinkButton href="/experiences" variant="secondary" size="lg">
              {t('outroCtaExperiences')}
            </LinkButton>
          </div>
        </div>
      </Band>
    </>
  );
}

function FallbackGrid({ items }: { items: ArticleFilterItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <div key={it.id}>{it.node}</div>
      ))}
    </div>
  );
}
