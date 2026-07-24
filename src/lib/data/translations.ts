import type { Locale } from '@/i18n/routing';

const DEFAULT_LOCALE: Locale = 'ja';

/**
 * 翻訳行の配列から、要求 locale の行を選ぶ。無ければ日本語へフォールバックする（§5）。
 *
 * クエリ側は RLS により published の翻訳のみを返す前提（最大 ja/en の 2 行）。
 * ここでフォールバックを一元化し、ページ側にロジックを漏らさない。
 *
 * @returns translation: 選ばれた翻訳行（ja も無ければ null）
 *          isFallback: 要求 locale が無く、日本語へ落ちた場合に true
 */
export function resolveTranslation<T extends { locale: string }>(
  rows: T[],
  locale: Locale,
): { translation: T | null; isFallback: boolean } {
  const requested = rows.find((row) => row.locale === locale);
  if (requested) {
    return { translation: requested, isFallback: false };
  }

  const fallback = rows.find((row) => row.locale === DEFAULT_LOCALE) ?? null;
  return {
    translation: fallback,
    isFallback: locale !== DEFAULT_LOCALE && fallback !== null,
  };
}

/**
 * 英字併走（DESIGN §3.3 層 2）用に EN の翻訳行を取り出す。
 *
 * クエリは locale で絞らず published 翻訳を全取得しているので、**追加クエリは不要**。
 * この配列から EN 行を拾うだけで済む。
 *
 * - EN 未公開なら RLS で行自体が来ない → null（＝英字行を省略する）
 * - EN ロケールでは常に null。見出しも英語になり同じ言語が 2 行続くため（§3.3）
 */
export function resolveEnglishTranslation<T extends { locale: string }>(
  rows: T[],
  locale: Locale,
): T | null {
  if (locale === 'en') return null;
  return rows.find((row) => row.locale === 'en') ?? null;
}
