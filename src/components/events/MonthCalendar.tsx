'use client';

import { type ReactNode, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

export type EventCalendarItem = {
  id: string;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string | null;
  isEnded: boolean;
  craftSlug: string | null;
  node: ReactNode;
};

type Props = {
  items: EventCalendarItem[];
  today: string; // 'YYYY-MM-DD'（server の todayISO。ハイドレーション不一致回避）
  experienceNodes: ReactNode[];
};

const LOCALE_TAG: Record<string, string> = { ja: 'ja-JP', en: 'en-US' };

const pad = (n: number) => String(n).padStart(2, '0');
const daysInMonth = (year: number, month1: number) => new Date(year, month1, 0).getDate();

/**
 * 自作の月カレンダー（DESIGN §5.3・ライブラリ不使用）。イベント日に藤紫の結び目ドット、
 * 月移動＋「今日」、日クリックで当日イベントを下に表示。空月は随時体験を併記（空白ページ禁止）。
 * 曜日/月見出しは Intl でロケール生成。日付判定は 'YYYY-MM-DD' の辞書順比較（＝時系列）。
 */
export function MonthCalendar({ items, today, experienceNodes }: Props) {
  const t = useTranslations('Events');
  const locale = useLocale();
  const tag = LOCALE_TAG[locale] ?? 'ja-JP';

  const [ty, tm] = today.split('-').map(Number);
  const [cursor, setCursor] = useState<{ y: number; m: number }>({ y: ty, m: tm });
  const [selected, setSelected] = useState<string | null>(today);

  const weekdays = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(tag, { weekday: 'short' });
    // 2023-01-01 は日曜
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2023, 0, 1 + i)));
  }, [tag]);

  const first = new Date(cursor.y, cursor.m - 1, 1);
  const startWeekday = first.getDay();
  const numDays = daysInMonth(cursor.y, cursor.m);
  const monthLabel = new Intl.DateTimeFormat(tag, {
    year: 'numeric',
    month: 'long',
  }).format(first);

  const eventsOnDay = (dayStr: string) =>
    items.filter(
      (it) => dayStr >= it.startDate && dayStr <= (it.endDate ?? it.startDate),
    );

  const monthStart = `${cursor.y}-${pad(cursor.m)}-01`;
  const monthEnd = `${cursor.y}-${pad(cursor.m)}-${pad(numDays)}`;
  const monthHasEvents = items.some(
    (it) => it.startDate <= monthEnd && (it.endDate ?? it.startDate) >= monthStart,
  );

  const move = (delta: number) =>
    setCursor(({ y, m }) => {
      const idx = y * 12 + (m - 1) + delta;
      return { y: Math.floor(idx / 12), m: (idx % 12) + 1 };
    });
  const goToday = () => {
    setCursor({ y: ty, m: tm });
    setSelected(today);
  };

  const selectedEvents = selected ? eventsOnDay(selected) : [];
  const selectedLabel = selected
    ? new Intl.DateTimeFormat(tag, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      }).format(
        (() => {
          const [y, m, d] = selected.split('-').map(Number);
          return new Date(y, m - 1, d);
        })(),
      )
    : '';

  return (
    <div>
      {/* 月ヘッダ */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="前の月"
            className="flex h-11 w-11 items-center justify-center rounded-full text-h3 text-foreground hover:bg-primary-100"
          >
            ‹
          </button>
          <h2 className="min-w-[8rem] text-center text-h3">{monthLabel}</h2>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="次の月"
            className="flex h-11 w-11 items-center justify-center rounded-full text-h3 text-foreground hover:bg-primary-100"
          >
            ›
          </button>
        </div>
        <button
          type="button"
          onClick={goToday}
          className="inline-flex min-h-11 items-center rounded-full border border-border bg-surface px-4 text-caption font-medium hover:bg-primary-100"
        >
          {t('today')}
        </button>
      </div>

      {/* 曜日ヘッダ */}
      <div className="mt-4 grid grid-cols-7 text-center">
        {weekdays.map((w) => (
          <div key={w} className="pb-2 text-caption text-muted">
            {w}
          </div>
        ))}
      </div>

      {/* 日グリッド */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startWeekday }).map((_, i) => (
          <div key={`blank-${i}`} aria-hidden="true" />
        ))}
        {Array.from({ length: numDays }, (_, i) => i + 1).map((dayNum) => {
          const dayStr = `${cursor.y}-${pad(cursor.m)}-${pad(dayNum)}`;
          const dayEvents = eventsOnDay(dayStr);
          const hasEvents = dayEvents.length > 0;
          const hasUpcoming = dayEvents.some((it) => !it.isEnded);
          const isToday = dayStr === today;
          const isSelected = dayStr === selected;
          return (
            <button
              key={dayStr}
              type="button"
              disabled={!hasEvents}
              onClick={() => setSelected(dayStr)}
              aria-pressed={isSelected}
              className={cn(
                'relative flex h-11 flex-col items-center justify-center rounded-md text-caption',
                hasEvents ? 'cursor-pointer hover:bg-primary-100' : 'text-muted',
                isSelected && 'bg-primary-100',
                isToday && 'font-bold text-primary-700',
              )}
            >
              <span>{dayNum}</span>
              {hasEvents && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-0.5 h-1.5 w-1.5 rounded-full',
                    hasUpcoming ? 'bg-primary-600' : 'bg-ended',
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* 選択日のイベント / 空月は随時体験を併記 */}
      {monthHasEvents ? (
        <div className="mt-6">
          <h3 className="text-caption font-medium text-muted">{selectedLabel}</h3>
          {selectedEvents.length > 0 ? (
            <div className="mt-3 flex flex-col gap-3">
              {selectedEvents.map((it) => (
                <div key={it.id}>{it.node}</div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-body text-muted">{t('noEventsOnDay')}</p>
          )}
        </div>
      ) : (
        <div className="mt-8">
          <h3 className="text-h3">{t('alsoExperiences')}</h3>
          <div className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {experienceNodes.map((node, i) => (
              <div key={i}>{node}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
