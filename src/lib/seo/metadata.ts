import type { Metadata } from 'next';
import { routing, type Locale } from '@/i18n/routing';
import { SITE_NAME, localePath } from './config';

/**
 * generateMetadata 用の共通ヘルパ（docs/14）。
 * `path` は locale を含まないパス（例 '/crafts/toyama-fuji-ito'・home は ''）。
 * 値は相対でよい（ルート layout の metadataBase が絶対化する）。
 */

const OG_LOCALE: Record<string, string> = { ja: 'ja_JP', en: 'en_US' };

/** canonical（locale 自己参照）+ hreflang（ja / en / x-default=ja）。 */
export function alternatesFor(locale: Locale, path = ''): Metadata['alternates'] {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = localePath(l, path);
  languages['x-default'] = localePath(routing.defaultLocale, path);
  return { canonical: localePath(locale, path), languages };
}

type OgOptions = {
  locale: Locale;
  path?: string;
  title?: string;
  description?: string | null;
  type?: 'website' | 'article';
  publishedTime?: string | null;
};

/** openGraph（記事詳細のみ type:'article' + publishedTime）。 */
export function openGraphFor({
  locale,
  path = '',
  title,
  description,
  type = 'website',
  publishedTime,
}: OgOptions): Metadata['openGraph'] {
  const base = {
    title,
    description: description ?? undefined,
    url: localePath(locale, path),
    siteName: SITE_NAME,
    locale: OG_LOCALE[locale] ?? 'ja_JP',
  };
  if (type === 'article') {
    return { ...base, type: 'article', publishedTime: publishedTime ?? undefined };
  }
  return { ...base, type: 'website' };
}

export function twitterFor({
  title,
  description,
}: {
  title?: string;
  description?: string | null;
}): Metadata['twitter'] {
  return { card: 'summary_large_image', title, description: description ?? undefined };
}
