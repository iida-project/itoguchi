import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { getArticles, getArticleBySlug, getCrafts } from '@/lib/data';
import { formatDate } from '@/lib/date';
import { sanitizeArticleHtml } from '@/lib/sanitize';
import { JapaneseOnlyBanner } from '@/components/layout/JapaneseOnlyBanner';
import { Band } from '@/components/layout/Band';
import { Kicker, SectionHeading } from '@/components/ui/SectionHeading';
import { LinkButton } from '@/components/ui/LinkButton';

export const revalidate = 3600;
export const dynamicParams = true;

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const articles = await getArticles(routing.defaultLocale);
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const article = await getArticleBySlug(slug, locale);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
  };
}

/**
 * 記事詳細（DESIGN.md §6 記事詳細）。読み物レイアウト（720px）。
 * 面の順序は 1（Hero）→ 3（本文の白ブロック）→ 2（関連工芸）→ 4（フッター）。
 *
 * **本文のタイポは `.article-content`（globals.css）のまま**で、見出しに `SectionHeading` は
 * 使わない（§6「記事本文用のタイポを維持する」）。v0.2 化するのはページ枠だけ。
 */
export default async function ArticleDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const [t, tCommon, article, crafts] = await Promise.all([
    getTranslations('Articles'),
    getTranslations('Common'),
    getArticleBySlug(slug, locale as Locale),
    getCrafts(locale as Locale),
  ]);
  if (!article) {
    notFound();
  }

  const craft = article.craftId
    ? (crafts.find((c) => c.id === article.craftId) ?? null)
    : null;

  // kicker は `Journal · 遠山ふじ糸 · 8月23日(土)`
  const kicker = [
    t('detailKicker'),
    craft?.name,
    article.publishedAt ? formatDate(article.publishedAt, locale) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      {locale === 'en' && article.isFallback && <JapaneseOnlyBanner />}

      <article>
        {/* 面 1: Hero */}
        <Band width="reading" padding="none">
          <div className="py-14 md:py-20">
            <Kicker rule={40} className="mb-5">
              {kicker}
            </Kicker>
            <h1 className="font-display text-display">{article.title}</h1>
            {article.excerpt && (
              <p className="mt-6 font-display text-lead text-primary-700">{article.excerpt}</p>
            )}

            {article.thumbnail && (
              <div
                className="relative mt-10 overflow-hidden rounded-lg shadow-deep"
                style={{ aspectRatio: '16 / 9' }}
              >
                <Image
                  src={article.thumbnail}
                  alt={article.thumbnailAlt ?? ''}
                  fill
                  priority
                  sizes="(max-width: 720px) 100vw, 720px"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </Band>

        {/* 面 3: 本文（白ブロック・読み物幅）。.article-content は据え置き */}
        <Band tone="surface" width="reading" padding="block" bordered>
          {article.content ? (
            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.content) }}
            />
          ) : (
            article.excerpt && <p className="text-body-lg">{article.excerpt}</p>
          )}
        </Band>
      </article>

      {/* 面 2: 関連工芸への相互導線 */}
      <Band tone="warm" padding="block">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <SectionHeading
              kicker={craft ? t('relatedCraft') : t('outroKicker')}
              title={t('outroTitle')}
              en={t('outroEn')}
              className="mb-4"
            />
            {craft ? (
              <p className="font-display text-lead text-primary-700">{craft.name}</p>
            ) : (
              <p className="max-w-reading text-body text-muted">{t('outroLead')}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-3.5">
            {/* ボタンのラベルに工芸名（可変長）を入れない。ピル型は whitespace-nowrap のため
                長い名前が SP で横スクロールを起こす（EN の工芸名で実測） */}
            <LinkButton href={craft ? `/crafts/${craft.slug}` : '/crafts'} size="lg">
              {craft ? t('outroCtaCraft') : t('browseCrafts')} →
            </LinkButton>
            <LinkButton href="/articles" variant="secondary" size="lg">
              {tCommon('backToList')}
            </LinkButton>
          </div>
        </div>
      </Band>
    </>
  );
}
