/**
 * 月カレンダーと月グルーピングの純関数（docs/19）。
 *
 * サーバー（Suspense fallback）とクライアント（MonthCalendar / MiniCalendar）の
 * 両方から使うので、`'use client'` も `server-only` も付けない。
 * 日付は全て 'YYYY-MM-DD' の文字列で扱い、辞書順比較＝時系列比較になる性質を利用する。
 */

export type YearMonth = { y: number; m: number };

/** 日付の範囲を持つもの（イベント行・カレンダー項目の最小インターフェース） */
type DateRanged = {
  startDate: string;
  endDate: string | null;
};

const pad = (n: number) => String(n).padStart(2, '0');

export const toDateString = (y: number, m: number, d: number) =>
  `${y}-${pad(m)}-${pad(d)}`;

export const daysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();

/** `{y, m}` を delta ヶ月ずらす（年跨ぎを正しく処理する） */
export function shiftMonth({ y, m }: YearMonth, delta: number): YearMonth {
  const idx = y * 12 + (m - 1) + delta;
  return { y: Math.floor(idx / 12), m: (idx % 12) + 1 };
}

export type MonthCell = {
  date: string;
  day: number;
  /** その月の日か（前後月のはみ出し日は false） */
  inMonth: boolean;
};

/**
 * 月グリッドのセル配列を作る。日曜始まりで前後の月を埋め、必ず 7 の倍数個返す。
 * 前後月を空白ではなく実日付で埋めるのは、グリッドの升目が欠けて見えないようにするため。
 */
export function buildMonthMatrix({ y, m }: YearMonth): MonthCell[] {
  const first = new Date(y, m - 1, 1);
  const lead = first.getDay();
  const total = daysInMonth(y, m);
  const prev = shiftMonth({ y, m }, -1);
  const prevTotal = daysInMonth(prev.y, prev.m);
  const next = shiftMonth({ y, m }, 1);

  const cells: MonthCell[] = [];

  for (let i = lead - 1; i >= 0; i -= 1) {
    const day = prevTotal - i;
    cells.push({ date: toDateString(prev.y, prev.m, day), day, inMonth: false });
  }
  for (let day = 1; day <= total; day += 1) {
    cells.push({ date: toDateString(y, m, day), day, inMonth: true });
  }
  // 末尾を週の切れ目まで埋める
  while (cells.length % 7 !== 0) {
    const day = cells.length - lead - total + 1;
    cells.push({ date: toDateString(next.y, next.m, day), day, inMonth: false });
  }

  return cells;
}

/** その日に開催されているもの（複数日イベントは期間内の全日にヒットする） */
export function eventsOnDay<T extends DateRanged>(items: T[], date: string): T[] {
  return items.filter((it) => date >= it.startDate && date <= (it.endDate ?? it.startDate));
}

/** その月に 1 日でもかかるものがあるか */
export function hasEventsInMonth<T extends DateRanged>(
  items: T[],
  { y, m }: YearMonth,
): boolean {
  const start = toDateString(y, m, 1);
  const end = toDateString(y, m, daysInMonth(y, m));
  return items.some((it) => it.startDate <= end && (it.endDate ?? it.startDate) >= start);
}

export type MonthGroupData<T> = {
  /** 'YYYY-MM' */
  key: string;
  year: number;
  month: number;
  items: T[];
};

/**
 * 開催月ごとに束ねる（DESIGN §5.3 の月グルーピング）。開始日の月に属させる。
 * 入力の順序は保ち、月キーの昇順で返す。
 */
export function groupEventsByMonth<T extends DateRanged>(items: T[]): MonthGroupData<T>[] {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = item.startDate.slice(0, 7);
    const bucket = map.get(key);
    if (bucket) bucket.push(item);
    else map.set(key, [item]);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, groupItems]) => {
      const [year, month] = key.split('-').map(Number);
      return { key, year, month, items: groupItems };
    });
}
