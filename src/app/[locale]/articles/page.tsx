import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { getArticles, getCrafts } from '@/lib/data';
import { ArticleCard } from '@/components/articles/ArticleCard';
import {
  ArticleFilterList,
  type ArticleFilterItem,
} from '@/components/articles/ArticleFilterList';

export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'Articles' });
  return { title: t('listTitle') };
}

export default async function ArticlesPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const [t, articles, crafts] = await Promise.all([
    getTranslations('Articles'),
    getArticles(locale as Locale),
    getCrafts(locale as Locale),
  ]);

  const craftById = new Map(crafts.map((c) => [c.id, { slug: c.slug, name: c.name }]));

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
    <div className="mx-auto max-w-content px-6 py-section-sm md:py-section">
      <header className="mb-8">
        <h1 className="text-display">{t('listTitle')}</h1>
        <p className="mt-3 max-w-reading text-body-lg text-muted">{t('lead')}</p>
      </header>

      <Suspense fallback={<FallbackGrid items={items} />}>
        <ArticleFilterList items={items} crafts={filterCrafts} />
      </Suspense>
    </div>
  );
}

function FallbackGrid({ items }: { items: ArticleFilterItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <div key={it.id}>{it.node}</div>
      ))}
    </div>
  );
}
