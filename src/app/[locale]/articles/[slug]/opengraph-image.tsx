import { routing } from '@/i18n/routing';
import { getArticles, getArticleBySlug } from '@/lib/data';
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage, resolveOgParams } from '@/lib/og/image';

export const alt = 'いとぐち / Itoguchi — 南信州の伝統工芸';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const revalidate = 3600;

export async function generateStaticParams() {
  const articles = await getArticles(routing.defaultLocale);
  return routing.locales.flatMap((locale) => articles.map((a) => ({ locale, slug: a.slug })));
}

export default async function Image({ params }: { params: { locale: string; slug: string } }) {
  const { locale, slug } = await resolveOgParams(params);
  const article = await getArticleBySlug(slug, locale);
  const date = article?.publishedAt ? article.publishedAt.slice(0, 10).replaceAll('-', '.') : null;

  return renderOgImage({
    locale,
    kicker: ['Journal', date].filter(Boolean).join(' · '),
    title: article?.title ?? 'いとぐち',
    note: article?.excerpt ?? null,
  });
}
