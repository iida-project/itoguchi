import { defineRouting } from 'next-intl/routing';

/**
 * サイト全体のロケール定義。
 * ロケールを増やすときはこの `locales` に追加するだけで済むようにしている
 * （REQUIREMENTS.md §5「locale 追加可能な構造」）。
 */
export const routing = defineRouting({
  // サポートするロケール一覧。日本語が正本、英語を MVP から公開
  locales: ['ja', 'en'],

  // どのロケールにもマッチしないとき（`/` の初期リダイレクト先の既定）に使う
  defaultLocale: 'ja',

  // 常に `/ja` `/en` のようにプレフィックスを付ける
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];
