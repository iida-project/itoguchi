'use client';

import { type ReactNode, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  buildMonthMatrix,
  eventsOnDay,
  hasEventsInMonth,
  shiftMonth,
  type YearMonth,
} from '@/lib/calendar';
import { englishMonthName, wafuMonthName } from '@/lib/date';
import { cn } from '@/lib/cn';
import type { Locale } from '@/i18n/routing';

export type EventCalendarItem = {
  id: string;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string | null;
  isEnded: boolean;
  craftSlug: string | null;
  /** カレンダーのセルに出す短いタイトル */
  title: string;
  /** サーバーで確定済みのイベント行 */
  node: ReactNode;
};

type Props = {
  items: EventCalendarItem[];
  today: string; // 'YYYY-MM-DD'（server の todayISO。ハイドレーション不一致回避）
  experienceNodes: ReactNode[];
};

const CELL_EVENT_LIMIT = 2;

/**
 * 自作の月カレンダー（DESIGN §5.3 / §6・ライブラリ不使用）。
 * セル最小高 120px で**イベント名を直接表示**し、結び目ドットで状態を示す
 * （金 = 開催予定 / 鈍色 = 終了。「要予約」はデータモデルに無いので 2 色）。
 *
 * 月グリッドの計算は `lib/calendar.ts` の純関数に寄せ、MiniCalendar と共有する。
 */
export function MonthCalendar({ items, today, experienceNodes }: Props) {
  const t = useTranslations('Events');
  const locale = useLocale() as Locale;
  const tag = locale === 'en' ? 'en-US' : 'ja-JP';

  const [ty, tm] = today.split('-').map(Number);
  const [cursor, setCursor] = useState<YearMonth>({ y: ty, m: tm });
  const [selected, setSelected] = useState<string | null>(today);

  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2023, 0, 1 + i)));
  }, []);

  const cells = useMemo(() => buildMonthMatrix(cursor), [cursor]);
  const monthHasEvents = hasEventsInMonth(items, cursor);
  const selectedEvents = selected ? eventsOnDay(items, selected) : [];
  const selectedLabel = selected
    ? new Intl.DateTimeFormat(tag, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
        timeZone: 'Asia/Tokyo',
      }).format(new Date(`${selected}T00:00:00+09:00`))
    : '';

  return (
    <div>
      {/* 月ヘッダ */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <h2 className="flex items-baseline gap-3 font-jp text-[32px] font-bold tracking-[0.06em] text-primary-700 md:text-[48px]">
          {locale === 'en' ? englishMonthName(cursor.m) : `${cursor.m}月`}
          <small className="font-en text-[18px] font-normal italic tracking-[0.08em] text-gold-800 [font-synthesis:none] md:text-[22px]">
            {locale === 'en'
              ? `· ${wafuMonthName(cursor.m, locale)}`
              : `${englishMonthName(cursor.m)} · ${wafuMonthName(cursor.m, locale)}`}
          </small>
          <span className="font-en text-[16px] font-normal text-muted">{cursor.y}</span>
        </h2>
        <div className="flex items-center gap-2">
          <NavButton label={t('prevMonth')} onClick={() => setCursor(shiftMonth(cursor, -1))}>
            ‹
          </NavButton>
          <button
            type="button"
            onClick={() => {
              setCursor({ y: ty, m: tm });
              setSelected(today);
            }}
            className="inline-flex h-10 items-center rounded-full border border-primary-600 bg-primary-600 px-5 text-caption font-medium text-white transition-colors duration-250 ease-out hover:bg-primary-700"
          >
            {t('today')}
          </button>
          <NavButton label={t('nextMonth')} onClick={() => setCursor(shiftMonth(cursor, 1))}>
            ›
          </NavButton>
        </div>
      </div>

      {/* 日グリッド（1px の隙間を border 色で見せる） */}
      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-md border border-border bg-border">
        {weekdays.map((w) => (
          <div
            key={w}
            className="bg-primary-100 px-2 py-3 font-en text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-700 md:px-4"
          >
            {w.slice(0, 3)}
          </div>
        ))}
        {cells.map((cell) => {
          const dayEvents = eventsOnDay(items, cell.date);
          const isToday = cell.date === today;
          const isSelected = cell.date === selected;
          return (
            <button
              key={cell.date}
              type="button"
              onClick={() => setSelected(cell.date)}
              aria-pressed={isSelected}
              className={cn(
                'min-h-[88px] p-2 text-left align-top transition-colors duration-250 ease-out md:min-h-[120px] md:p-3',
                cell.inMonth ? 'bg-surface hover:bg-primary-50' : 'bg-warm text-muted',
                isSelected && 'bg-primary-50',
              )}
            >
              <span
                className={cn(
                  'font-en text-[15px] font-medium',
                  isToday &&
                    'inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-white',
                )}
              >
                {cell.day}
              </span>
              {dayEvents.slice(0, CELL_EVENT_LIMIT).map((event) => (
                <span
                  key={event.id}
                  className={cn(
                    'mt-1.5 flex items-center gap-1.5 truncate rounded-sm px-2 py-1 text-[11px] font-semibold leading-tight',
                    event.isEnded
                      ? 'bg-ended-100 text-muted'
                      : 'bg-primary-100 text-primary-700',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'h-1.5 w-1.5 shrink-0 rounded-full',
                      event.isEnded ? 'bg-ended' : 'bg-gold-600',
                    )}
                  />
                  <span className="truncate">{event.title}</span>
                </span>
              ))}
              {dayEvents.length > CELL_EVENT_LIMIT && (
                <span className="mt-1 block text-[11px] text-muted">
                  +{dayEvents.length - CELL_EVENT_LIMIT}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 選択日のイベント */}
      {monthHasEvents && (
        <div className="mt-8">
          <h3 className="text-caption font-medium text-muted">{selectedLabel}</h3>
          {selectedEvents.length > 0 ? (
            <div className="mt-3 flex flex-col gap-4">
              {selectedEvents.map((it) => (
                <div key={it.id}>{it.node}</div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-body text-muted">{t('noEventsOnDay')}</p>
          )}
        </div>
      )}

      {/* 空白ページ禁止（§6）: 開催予定が無い日でも随時受付の体験を必ず併記する */}
      <div className="mt-8 rounded-md bg-primary-100 p-6">
        <p className="font-display text-h4 text-primary-700">{t('emptyMonthNote')}</p>
        {experienceNodes.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {experienceNodes.map((node, i) => (
              <div key={i}>{node}</div>
            ))}
          </div>
        )}
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
      className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-h3 text-foreground transition-colors duration-250 ease-out hover:bg-primary-100"
    >
      {children}
    </button>
  );
}
