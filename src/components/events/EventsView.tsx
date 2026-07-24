'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';
import { FilterChip } from '@/components/ui/FilterChip';
import { groupEventsByMonth } from '@/lib/calendar';
import { MiniCalendar } from './MiniCalendar';
import { MonthGroup } from './MonthGroup';
import { MonthCalendar, type EventCalendarItem } from './MonthCalendar';

type View = 'list' | 'calendar';
type Status = 'upcoming' | 'ended';

type Props = {
  items: EventCalendarItem[];
  crafts: Array<{ slug: string; name: string }>;
  experienceNodes: ReactNode[];
  today: string;
};

/**
 * イベント一覧のオーケストレータ（docs/08 / docs/19）。
 * リスト⇄カレンダー切替・工芸絞り込み・状態絞り込み・月グルーピング。
 *
 * ISR を保つためフィルタ/切替はクライアント側で行い、状態は window.history.replaceState で
 * `?view=&craft=&status=` に同期（ナビゲーション＝RSC 再取得を起こさず共有可能）。
 * カード（node）はサーバーで確定済みのものを表示するだけ。
 *
 * 状態チップが「開催予定 / 終了」の 2 つしか無いのは、受付状態（受付中・満員・要予約）を
 * 持つカラムがスキーマに無いため（モックの 3 群は再現できない）。
 */
export function EventsView({ items, crafts, experienceNodes, today }: Props) {
  const t = useTranslations('Events');
  const searchParams = useSearchParams();

  const [view, setView] = useState<View>(
    searchParams.get('view') === 'calendar' ? 'calendar' : 'list',
  );
  const [craft, setCraft] = useState<string | null>(searchParams.get('craft'));
  const [status, setStatus] = useState<Status | null>(
    searchParams.get('status') === 'ended'
      ? 'ended'
      : searchParams.get('status') === 'upcoming'
        ? 'upcoming'
        : null,
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (view === 'calendar') params.set('view', view);
    if (craft) params.set('craft', craft);
    if (status) params.set('status', status);
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [view, craft, status]);

  const byCraft = items.filter((it) => !craft || it.craftSlug === craft);
  const filtered = byCraft.filter((it) =>
    status === 'upcoming' ? !it.isEnded : status === 'ended' ? it.isEnded : true,
  );

  const upcoming = filtered.filter((it) => !it.isEnded);
  const ended = filtered.filter((it) => it.isEnded).reverse(); // 直近の過去から
  const monthGroups = groupEventsByMonth(upcoming);

  const countFor = (slug: string | null) =>
    items.filter((it) => (slug === null ? true : it.craftSlug === slug)).length;

  return (
    <div>
      {/* コントロール: 工芸チップ + 状態チップ + 表示切替 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip
            active={craft === null}
            count={countFor(null)}
            onClick={() => setCraft(null)}
          >
            {t('all')}
          </FilterChip>
          {crafts.map((c) => (
            <FilterChip
              key={c.slug}
              active={craft === c.slug}
              count={countFor(c.slug)}
              onClick={() => setCraft(craft === c.slug ? null : c.slug)}
            >
              {c.name}
            </FilterChip>
          ))}

          {/* 工芸で絞る群と状態で絞る群のあいだに間隔を空ける（§6） */}
          <span aria-hidden="true" className="w-3" />

          <FilterChip
            active={status === 'upcoming'}
            count={byCraft.filter((it) => !it.isEnded).length}
            onClick={() => setStatus(status === 'upcoming' ? null : 'upcoming')}
          >
            {t('statusUpcoming')}
          </FilterChip>
          <FilterChip
            active={status === 'ended'}
            count={byCraft.filter((it) => it.isEnded).length}
            onClick={() => setStatus(status === 'ended' ? null : 'ended')}
          >
            {t('statusEnded')}
          </FilterChip>
        </div>

        <div className="inline-flex rounded-full border border-border bg-surface p-1">
          <ToggleButton active={view === 'list'} onClick={() => setView('list')}>
            ☰ {t('viewList')}
          </ToggleButton>
          <ToggleButton active={view === 'calendar'} onClick={() => setView('calendar')}>
            ▦ {t('viewCalendar')}
          </ToggleButton>
        </div>
      </div>

      {/* カレンダー表示は全幅（サイドバーを畳む）。リスト表示は 2 カラム（§6） */}
      <div
        className={cn(
          'mt-10',
          view === 'list' && 'lg:grid lg:grid-cols-[1fr_380px] lg:gap-16',
        )}
      >
        {view === 'calendar' ? (
          <MonthCalendar items={filtered} today={today} experienceNodes={experienceNodes} />
        ) : (
          <div className="min-w-0">
            {monthGroups.length > 0 ? (
              monthGroups.map((group) => (
                <MonthGroup
                  key={group.key}
                  year={group.year}
                  month={group.month}
                  count={group.items.length}
                >
                  <ul className="flex flex-col gap-4">
                    {group.items.map((it) => (
                      <li key={it.id}>{it.node}</li>
                    ))}
                  </ul>
                </MonthGroup>
              ))
            ) : (
              <p className="text-body text-muted">{t('emptyUpcoming')}</p>
            )}

            {/* 過去のイベント（アーカイブ） */}
            {ended.length > 0 && (
              <section className="mt-4">
                <div className="mb-6 flex flex-wrap items-baseline gap-x-4 border-b border-border pb-4">
                  <h2 className="font-display text-h3 text-muted">{t('pastEvents')}</h2>
                  <span className="font-en text-[13px] italic tracking-[0.1em] text-muted [font-synthesis:none]">
                    {t('pastEventsEn')}
                  </span>
                </div>
                <ul className="flex flex-col gap-4">
                  {ended.map((it) => (
                    <li key={it.id}>{it.node}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        {view === 'list' && (
          <aside className="mt-14 lg:mt-0">
            <SideHeading title={t('alsoExperiences')} en={t('anytimeEn')} />
            <div className="mb-10 mt-4 flex flex-col gap-3">
              {experienceNodes.map((node, i) => (
                <div key={i}>{node}</div>
              ))}
            </div>

            <SideHeading title={t('miniCalTitle')} en={t('miniCalEn')} />
            <div className="mt-4">
              <MiniCalendar items={items} today={today} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function SideHeading({ title, en }: { title: string; en: string }) {
  return (
    <div>
      <h2 className="flex items-center gap-2.5 font-display text-h3">
        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-600" />
        {title}
      </h2>
      <p className="mt-1 pl-4 font-en text-[12px] italic tracking-[0.12em] text-muted [font-synthesis:none]">
        {en}
      </p>
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
        'inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-caption font-semibold transition-colors duration-250 ease-out',
        active ? 'bg-primary-600 text-white' : 'text-muted hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}
