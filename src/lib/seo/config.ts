import 'server-only';
import type { Locale } from '@/i18n/routing';

/**
 * SEO の基礎設定（docs/14 / docs/16）。next-intl 非依存なので sitemap.ts / robots.ts からも
 * import できる。
 *
 * **`server-only`**: `SITE_URL` の解決に Vercel のシステム環境変数（`VERCEL_URL` /
 * `VERCEL_PROJECT_PRODUCTION_URL`）を使う。これらは `NEXT_PUBLIC_` ではないため
 * クライアントバンドルでは `undefined` になる。うっかり Client Component から import すると
 * URL が静かに壊れるので、ビルド時に弾けるようにしておく。
 */

/**
 * サイトの絶対 URL（末尾スラッシュを除去）。canonical・hreflang・sitemap・JSON-LD・
 * `metadataBase` の基点になる。
 *
 * 解決の順序:
 * 1. `NEXT_PUBLIC_SITE_URL` — 明示指定。ローカル開発と、独自ドメインを取ったあとの本番
 * 2. Vercel の preview デプロイなら `VERCEL_URL` — そのデプロイ上で og:image が解決できる
 * 3. `VERCEL_PROJECT_PRODUCTION_URL` — 本番。独自ドメインを足せば自動で追随する
 * 4. ローカルは `http://localhost:3000`
 *
 * **既定値に実在ドメインを置かない**。以前は `https://itoguchi.jp` を既定にしていたが、
 * このドメインは第三者が使用しており、env を入れ忘れると canonical も sitemap も og:image も
 * すべて他人のサイトを指してしまう（docs/16 で修正）。
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, '');

  const vercelHost =
    process.env.VERCEL_ENV === 'preview'
      ? process.env.VERCEL_URL
      : process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelHost) return `https://${vercelHost.replace(/\/+$/, '')}`;

  // Vercel 上なのにホストが取れない = システム環境変数が無効。localhost の canonical を
  // 出荷するより落とす方が安全（Project Settings の "Enable access to System Environment
  // Variables" を確認する）。
  if (process.env.VERCEL) {
    throw new Error(
      'SITE_URL を解決できません。Vercel の「システム環境変数へのアクセス」を有効にするか、NEXT_PUBLIC_SITE_URL を設定してください。',
    );
  }

  return 'http://localhost:3000';
}

export const SITE_URL = resolveSiteUrl();

/** サイト名（locale 別）。og:site_name・title テンプレート・JSON-LD の name に使う。 */
const SITE_NAMES: Record<string, string> = { ja: 'いとぐち', en: 'Itoguchi' };

/** 日本語（正本）のサイト名。locale が分かる場所では `siteName(locale)` を使う。 */
export const SITE_NAME = SITE_NAMES.ja;

export function siteName(locale: Locale | string): string {
  return SITE_NAMES[locale] ?? SITE_NAME;
}

/**
 * 公開フェーズ。'preview'（交渉中・noindex）/ 'public'（本公開）。既定は安全側の preview。
 * **Vercel の Preview 環境とは無関係**。交渉中は Vercel の Production でも 'preview' にする。
 * `NEXT_PUBLIC_` はビルド時に固定されるので、切り替えには再デプロイが要る。
 */
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
