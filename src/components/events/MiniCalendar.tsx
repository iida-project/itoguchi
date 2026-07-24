'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  buildMonthMatrix,
  eventsOnDay,
  shiftMonth,
  type YearMonth,
} from '@/lib/calendar';
import { wafuMonthName } from '@/lib/date';
import { cn } from '@/lib/cn';
import type { Locale } from '@/i18n/routing';
import type { EventCalendarItem } from './MonthCalendar';

type MiniCalendarProps = {
  items: EventCalendarItem[];
  /** server の todayISO（ハイドレーション不一致回避） */
  today: string;
};

const LOCALE_TAG: Record<string, string> = { ja: 'ja-JP', en: 'en-US' };

/**
 * サイドバーのミニカレンダー（DESIGN.md §6 イベントカレンダー）。
 * 「今月をひらく」— 開催日にドットを打つだけの**表示専用**で、月移動のみ操作できる。
 * 日別の詳細はメインのリスト／カレンダー表示が担うので、ここでは選択状態を持たない。
 */
export function MiniCalendar({ items, today }: MiniCalendarProps) {
  const t = useTranslations('Events');
  const locale = useLocale() as Locale;
  const tag = LOCALE_TAG[locale] ?? 'ja-JP';

  const [ty, tm] = today.split('-').map(Number);
  const [cursor, setCursor] = useState<YearMonth>({ y: ty, m: tm });

  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
    // 2023-01-01 は日曜
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2023, 0, 1 + i)));
  }, []);

  const cells = useMemo(() => buildMonthMatrix(cursor), [cursor]);
  const monthLabel = new Intl.DateTimeFormat(tag, {
    year: 'numeric',
    month: 'long',
  }).format(new Date(cursor.y, cursor.m - 1, 1));

  return (
    <div className="rounded-md border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="font-jp text-[16px] font-bold tracking-[0.04em] text-primary-700">
          {monthLabel}
          <span className="ml-1.5 font-en text-[12px] font-normal italic text-gold-800 [font-synthesis:none]">
            · {wafuMonthName(cursor.m, locale)}
          </span>
        </p>
        <div className="flex gap-1">
          <NavButton label={t('prevMonth')} onClick={() => setCursor(shiftMonth(cursor, -1))}>
            ‹
          </NavButton>
          <NavButton label={t('nextMonth')} onClick={() => setCursor(shiftMonth(cursor, 1))}>
            ›
          </NavButton>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[12px]">
        {weekdays.map((w) => (
          <div
            key={w}
            className="py-1 font-en text-[10px] uppercase tracking-[0.08em] text-muted"
          >
            {w.slice(0, 3)}
          </div>
        ))}
        {cells.map((cell) => {
          const dayEvents = eventsOnDay(items, cell.date);
          const hasUpcoming = dayEvents.some((it) => !it.isEnded);
          return (
            <div
              key={cell.date}
              className={cn(
                'relative flex aspect-square items-center justify-center rounded-full',
                !cell.inMonth && 'text-border-strong',
                cell.date === today && 'bg-primary-600 font-semibold text-white',
              )}
            >
              {cell.day}
              {dayEvents.length > 0 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute bottom-1 h-1 w-1 rounded-full',
                    hasUpcoming ? 'bg-gold-600' : 'bg-ended',
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex gap-3 border-t border-dashed border-border pt-4 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gold-600" />
          {t('legendUpcoming')}
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-ended" />
          {t('statusEnded')}
        </span>
      </div>
    </div>
  );
}

function NavButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-[12px] text-foreground transition-colors duration-250 ease-out hover:bg-primary-100"
    >
      {children}
    </button>
  );
}
