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
 * 日付を「月／日／曜日」に分解して返す。イベント日付ブロック（DESIGN.md §5.3）用。
 * events の `start_date` は 'YYYY-MM-DD'（TZ なし）。`new Date()` はこれを UTC 深夜に
 * 解釈するため、実行環境の TZ 次第で日がずれ得る。todayISO と同じく Asia/Tokyo に固定して
 * 日付を安定させる。
 *
 * @returns ja: `{ month:'8月', day:'23', weekday:'土' }` / en: `{ month:'Aug', day:'23', weekday:'Sat' }`
 */
export function formatDateParts(
  date: Date | string,
  locale: Locale,
): { month: string; day: string; weekday: string } {
  const value = typeof date === 'string' ? new Date(date) : date;

  if (Number.isNaN(value.getTime())) {
    throw new Error(`formatDateParts: invalid date value: ${String(date)}`);
  }

  // 単一フィールドで format する。ja の 'long' month は "8月"（月付き）を返すが、
  // formatToParts だと '月' が literal に分かれてしまうため format() を使う。
  const opts = FORMAT_OPTIONS[locale];
  const fmt = (fieldOptions: Intl.DateTimeFormatOptions): string =>
    new Intl.DateTimeFormat(LOCALE_TAG[locale], {
      ...fieldOptions,
      timeZone: 'Asia/Tokyo',
    }).format(value);

  return {
    month: fmt({ month: opts.month }), // ja: '8月' / en: 'Aug'
    day: fmt({ day: 'numeric' }), //      '23'
    weekday: fmt({ weekday: opts.weekday }), // ja: '日' / en: 'Sun'
  };
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
