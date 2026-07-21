import type { Locale } from '@/i18n/routing';

const FORMAT_OPTIONS: Record<Locale, Intl.DateTimeFormatOptions> = {
  // 例: 8月23日(土)
  ja: { month: 'long', day: 'numeric', weekday: 'short' },
  // 例: Sat, Aug 23
  en: { weekday: 'short', month: 'short', day: 'numeric' },
};

const LOCALE_TAG: Record<Locale, string> = {
  ja: 'ja-JP',
  en: 'en-US',
};

/**
 * ロケールに応じた日付表示文字列を返す純関数。
 * next-intl の formatter に依存せず、サーバ/クライアント両方で使える。
 *
 * @param date Date か ISO 文字列（例: events の start_date）
 * @param locale 'ja' | 'en'
 * @returns ja: `8月23日(土)` / en: `Sat, Aug 23`
 */
export function formatDate(date: Date | string, locale: Locale): string {
  const value = typeof date === 'string' ? new Date(date) : date;

  if (Number.isNaN(value.getTime())) {
    throw new Error(`formatDate: invalid date value: ${String(date)}`);
  }

  return new Intl.DateTimeFormat(
    LOCALE_TAG[locale],
    FORMAT_OPTIONS[locale],
  ).format(value);
}

/**
 * 日本時間の「今日」を 'YYYY-MM-DD' で返す。
 * events の `date` 型（タイムゾーンなし）と文字列比較して終了判定に使う（§7）。
 */
export function todayISO(): string {
  // en-CA は YYYY-MM-DD 形式
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tokyo' }).format(
    new Date(),
  );
}
