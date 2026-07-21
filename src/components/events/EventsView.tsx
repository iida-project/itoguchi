'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { MonthCalendar, type EventCalendarItem } from './MonthCalendar';

type View = 'list' | 'calendar';

type Props = {
  items: EventCalendarItem[];
  crafts: Array<{ slug: string; name: string }>;
  experienceNodes: ReactNode[];
  today: string;
};

/**
 * イベント一覧のオーケストレータ（docs/08）。リスト⇄カレンダー切替・工芸絞り込み。
 * ISR を保つためフィルタ/切替はクライアント側で行い、状態は window.history.replaceState で
 * `?view=&craft=` に同期（ナビゲーション＝RSC 再取得を起こさず共有可能）。
 * カード（node）はサーバーで確定済みのものを表示するだけ。
 */
export function EventsView({ items, crafts, experienceNodes, today }: Props) {
  const t = useTranslations('Events');
  const searchParams = useSearchParams();

  const [view, setView] = useState<View>(
    searchParams.get('view') === 'calendar' ? 'calendar' : 'list',
  );
  const [craft, setCraft] = useState<string | null>(searchParams.get('craft'));

  useEffect(() => {
    const params = new URLSearchParams();
    if (view === 'calendar') params.set('view', view);
    if (craft) params.set('craft', craft);
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [view, craft]);

  const filtered = items.filter((it) => !craft || it.craftSlug === craft);
  const upcoming = filtered.filter((it) => !it.isEnded);
  const ended = filtered.filter((it) => it.isEnded).reverse(); // 直近の過去から

  return (
    <div>
      {/* コントロール: 表示切替 + 工芸絞り込み */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-full border border-border bg-surface p-0.5">
          <ToggleButton active={view === 'list'} onClick={() => setView('list')}>
            {t('viewList')}
          </ToggleButton>
          <ToggleButton active={view === 'calendar'} onClick={() => setView('calendar')}>
            {t('viewCalendar')}
          </ToggleButton>
        </div>

        {crafts.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-caption text-muted">{t('filterCraft')}</span>
            <Chip active={craft === null} onClick={() => setCraft(null)}>
              {t('all')}
            </Chip>
            {crafts.map((c) => (
              <Chip
                key={c.slug}
                active={craft === c.slug}
                onClick={() => setCraft(craft === c.slug ? null : c.slug)}
              >
                {c.name}
              </Chip>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8">
        {view === 'calendar' ? (
          <MonthCalendar items={filtered} today={today} experienceNodes={experienceNodes} />
        ) : (
          <div className="space-y-10">
            {/* 開催予定 */}
            {upcoming.length > 0 ? (
              <ul className="flex flex-col gap-4">
                {upcoming.map((it) => (
                  <li key={it.id}>{it.node}</li>
                ))}
              </ul>
            ) : (
              <div>
                <p className="text-body text-muted">{t('emptyUpcoming')}</p>
                <div className="mt-6">
                  <h2 className="text-h3">{t('alsoExperiences')}</h2>
                  <div className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {experienceNodes.map((node, i) => (
                      <div key={i}>{node}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 過去のイベント（アーカイブ） */}
            {ended.length > 0 && (
              <div>
                <h2 className="text-h3 text-muted">{t('pastEvents')}</h2>
                <ul className="mt-4 flex flex-col gap-4">
                  {ended.map((it) => (
                    <li key={it.id}>{it.node}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex min-h-11 items-center rounded-full px-4 text-caption font-medium transition-colors',
        active ? 'bg-primary-600 text-white' : 'text-muted hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex min-h-11 items-center rounded-full border px-3 text-caption font-medium transition-colors',
        active
          ? 'border-primary-600 bg-primary-600 text-white'
          : 'border-border bg-surface text-foreground hover:bg-primary-100',
      )}
    >
      {children}
    </button>
  );
}
