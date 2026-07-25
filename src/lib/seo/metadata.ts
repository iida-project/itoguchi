import type { Metadata } from 'next';
import { routing, type Locale } from '@/i18n/routing';
import { localePath, siteName } from './config';

/**
 * generateMetadata 用の共通ヘルパ（docs/14）。
 * `path` は locale を含まないパス（例 '/crafts/toyama-fuji-ito'・home は ''）。
 * 値は相対でよい（ルート layout の metadataBase が絶対化する）。
 */

const OG_LOCALE: Record<string, string> = { ja: 'ja_JP', en: 'en_US' };

type AlternatesOptions = {
  /**
   * 訳が公開されている locale（既定は全 locale）。日本語は正本なので常に含まれる。
   *
   * 未訳の locale は日本語へフォールバックして表示されるため（`isFallback`）、
   * そのまま hreflang に出すと「日本語の中身を英語版として申告した」ことになる。
   * サイトマップ側（`app/sitemap.ts`）と同じルールで落とす。
   */
  translatedLocales?: readonly Locale[];
};

/**
 * その locale のページを代表する locale。訳が無い locale は日本語を表示しているので
 * 日本語版が正になる。canonical と og:url を同じ URL に揃えるための単一の判定。
 */
function canonicalLocaleFor(locale: Locale, translatedLocales: readonly Locale[]): Locale {
  return locale === routing.defaultLocale || translatedLocales.includes(locale)
    ? locale
    : routing.defaultLocale;
}

/**
 * canonical + hreflang（ja / en / x-default=ja）。
 *
 * 訳のある locale だけを hreflang に出し、**自分の訳が無い locale では canonical を
 * 日本語版へ寄せる**（実体が同じページなので、別ページとして索引されず統合される）。
 */
export function alternatesFor(
  locale: Locale,
  path = '',
  { translatedLocales = routing.locales }: AlternatesOptions = {},
): Metadata['alternates'] {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    if (l === routing.defaultLocale || translatedLocales.includes(l)) {
      languages[l] = localePath(l, path);
    }
  }
  languages['x-default'] = localePath(routing.defaultLocale, path);
  return {
    canonical: localePath(canonicalLocaleFor(locale, translatedLocales), path),
    languages,
  };
}

/**
 * 詳細ページ用: EN 版データの `isFallback` から `translatedLocales` を作る。
 * EN が未公開（= フォールバック）または取得できないときは日本語のみ。
 */
export function translatedLocalesFrom(
  enVersion: { isFallback: boolean } | null | undefined,
): readonly Locale[] {
  return enVersion && !enVersion.isFallback ? routing.locales : [routing.defaultLocale];
}

type OgOptions = AlternatesOptions & {
  locale: Locale;
  path?: string;
  title?: string;
  description?: string | null;
  type?: 'website' | 'article';
  publishedTime?: string | null;
};

/**
 * openGraph（記事詳細のみ type:'article' + publishedTime）。
 * **og:url / og:locale は canonical と同じ locale に揃える**（未訳ページは日本語版が正）。
 */
export function openGraphFor({
  locale,
  path = '',
  title,
  description,
  type = 'website',
  publishedTime,
  translatedLocales = routing.locales,
}: OgOptions): Metadata['openGraph'] {
  const ogLocale = canonicalLocaleFor(locale, translatedLocales);
  const base = {
    title,
    description: description ?? undefined,
    url: localePath(ogLocale, path),
    siteName: siteName(ogLocale),
    locale: OG_LOCALE[ogLocale] ?? 'ja_JP',
  };
  if (type === 'article') {
    return { ...base, type: 'article', publishedTime: publishedTime ?? undefined };
  }
  return { ...base, type: 'website' };
}

/**
 * Twitter/X カード。
 * **og:image が入るまでは `summary`**（`summary_large_image` を画像なしで宣言しても
 * 大画像は描かれず、宣言だけが実態と食い違う）。OGP 画像を作る docs/15 で戻す。
 */
export function twitterFor({
  title,
  description,
}: {
  title?: string;
  description?: string | null;
}): Metadata['twitter'] {
  return { card: 'summary', title, description: description ?? undefined };
}
