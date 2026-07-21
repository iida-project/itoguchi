import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { getArticles, getArticleBySlug, getCrafts } from '@/lib/data';
import { formatDate } from '@/lib/date';
import { sanitizeArticleHtml } from '@/lib/sanitize';
import { JapaneseOnlyBanner } from '@/components/layout/JapaneseOnlyBanner';
import { ThreadDivider } from '@/components/ui/ThreadDivider';

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

  return (
    <>
      {locale === 'en' && article.isFallback && <JapaneseOnlyBanner />}

      <article className="mx-auto max-w-reading px-6 py-section-sm md:py-section">
        {craft && (
          <Link
            href={`/crafts/${craft.slug}`}
            className="text-caption font-medium text-primary-700 hover:underline"
          >
            {craft.name} ▸
          </Link>
        )}

        <h1 className="mt-2 font-display text-display">{article.title}</h1>

        {article.publishedAt && (
          <p className="mt-3 text-caption text-muted">
            {formatDate(article.publishedAt, locale)}
          </p>
        )}

        {article.thumbnail && (
          <div className="relative mt-6 overflow-hidden rounded-lg" style={{ aspectRatio: '16 / 9' }}>
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

        <ThreadDivider className="my-section-sm" />

        {article.content ? (
          <div
            className="article-content"
            dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(article.content) }}
          />
        ) : (
          article.excerpt && <p className="text-body-lg">{article.excerpt}</p>
        )}

        {/* 関連工芸への相互導線 */}
        {craft && (
          <>
            <ThreadDivider className="my-section-sm" />
            <div>
              <h2 className="text-caption font-medium text-muted">{t('relatedCraft')}</h2>
              <Link
                href={`/crafts/${craft.slug}`}
                className="mt-1 inline-block text-h3 text-primary-700 hover:underline"
              >
                {craft.name} ▸
              </Link>
            </div>
          </>
        )}

        <div className="mt-10">
          <Link href="/articles" className="text-caption text-primary-700 hover:underline">
            ← {tCommon('backToList')}
          </Link>
        </div>
      </article>
    </>
  );
}
