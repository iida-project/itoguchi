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
