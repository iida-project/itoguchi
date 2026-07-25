import type { Locale } from '@/i18n/routing';

/**
 * SEO の基礎設定（docs/14）。next-intl 非依存なので sitemap.ts / robots.ts からも import できる。
 * NEXT_PUBLIC_ なのでビルド時にインライン化される（phase 切替は再ビルドが必要）。
 */

/** サイトの絶対 URL（末尾スラッシュを除去）。canonical・sitemap・JSON-LD の基点。 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://itoguchi.jp').replace(/\/+$/, '');

export const SITE_NAME = 'いとぐち';

/** 公開フェーズ。'preview'（交渉中・noindex）/ 'public'（本公開）。既定は安全側の preview。 */
export const SITE_PHASE = process.env.NEXT_PUBLIC_SITE_PHASE === 'public' ? 'public' : 'preview';

/** インデックス許可か（public フェーズのみ）。 */
export const isIndexable = SITE_PHASE === 'public';

/** locale 付きの相対パス（metadata の alternates 用・metadataBase で絶対化される）。 */
export function localePath(locale: Locale | string, path = ''): string {
  return `/${locale}${path}`;
}

/** locale 付きの絶対 URL（sitemap・JSON-LD 用）。 */
export function absUrl(locale: Locale | string, path = ''): string {
  return `${SITE_URL}${localePath(locale, path)}`;
}
