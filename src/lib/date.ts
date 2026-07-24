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
    // 日は数字だけ欲しい。ja-JP の { day:'numeric' } は '23日' と単位付きで返すため、
    // 数字表記が同じ en-US で整形する（日付ブロックは大きな数字が視線のアンカー）
    day: new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      timeZone: 'Asia/Tokyo',
    }).format(value),
    weekday: fmt({ weekday: opts.weekday }), // ja: '日' / en: 'Sun'
  };
}

/*
 * 和風月名（DESIGN.md §5.3 の月グルーピング）。
 * 暦の固定名なので messages ではなくここに置く（翻訳フローに乗せる対象ではない）。
 * EN はローマ字併記の方針（DESIGN §10 の未決事項を docs/19 で決定）。
 */
const WAFU_MONTHS: Record<Locale, readonly string[]> = {
  ja: [
    '睦月', '如月', '弥生', '卯月', '皐月', '水無月',
    '文月', '葉月', '長月', '神無月', '霜月', '師走',
  ],
  en: [
    'Mutsuki', 'Kisaragi', 'Yayoi', 'Uzuki', 'Satsuki', 'Minazuki',
    'Fumizuki', 'Hazuki', 'Nagatsuki', 'Kannazuki', 'Shimotsuki', 'Shiwasu',
  ],
};

/**
 * 和風月名を返す。`8` → ja: `葉月` / en: `Hazuki`。
 * @param month 1〜12
 */
export function wafuMonthName(month: number, locale: Locale): string {
  return WAFU_MONTHS[locale][month - 1] ?? '';
}

/** 月の英字名（`August`）。月見出しの英字併走に使う */
export function englishMonthName(month: number): string {
  return new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'Asia/Tokyo' }).format(
    new Date(2026, month - 1, 1),
  );
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
