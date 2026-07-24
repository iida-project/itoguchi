import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { getCrafts, getEvents, getExperiences } from '@/lib/data';
import { groupEventsByMonth } from '@/lib/calendar';
import { todayISO } from '@/lib/date';
import { PageHero } from '@/components/layout/PageHero';
import { Stat } from '@/components/ui/Stat';
import { EventRow } from '@/components/events/EventRow';
import { MonthGroup } from '@/components/events/MonthGroup';
import { ExperienceCard } from '@/components/experiences/ExperienceCard';
import { EventsView } from '@/components/events/EventsView';
import type { EventCalendarItem } from '@/components/events/MonthCalendar';

// カレンダー/一覧は日次更新で十分（ISR。切替・絞り込みはクライアント側＝静的維持）
export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'Events' });
  return { title: t('listTitle') };
}

/**
 * イベントカレンダー（DESIGN.md §6・★案内係の中核）。
 *
 * **麻の葉パターンはこのページだけ**（§5.9）。写真が無く面積の広いページなので、
 * 地の紋で密度を作る。パターンの上には必ず不透明な面（カード・白ブロック）を重ねる。
 */
export default async function EventsPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const [t, events, crafts, experiences] = await Promise.all([
    getTranslations('Events'),
    getEvents(locale as Locale),
    getCrafts(locale as Locale),
    getExperiences(locale as Locale),
  ]);

  // craftId → { slug, name }
  const craftById = new Map(crafts.map((c) => [c.id, { slug: c.slug, name: c.name }]));

  // 事前レンダリングした行 + フィルタ/カレンダー用メタ
  const items: EventCalendarItem[] = events.map((event) => {
    const craft = event.craftId ? (craftById.get(event.craftId) ?? null) : null;
    return {
      id: event.id,
      startDate: event.startDate,
      endDate: event.endDate,
      isEnded: event.isEnded,
      craftSlug: craft?.slug ?? null,
      title: event.title,
      node: <EventRow event={event} locale={locale as Locale} craft={craft} variant="list" />,
    };
  });

  // 工芸チップは「イベントを持つ工芸」だけ
  const eventCraftSlugs = new Set(items.map((it) => it.craftSlug).filter(Boolean));
  const filterCrafts = crafts
    .filter((c) => eventCraftSlugs.has(c.slug))
    .map((c) => ({ slug: c.slug, name: c.name }));

  // サイドバー・空状態に併記する随時受付の体験
  const experienceNodes = experiences.map((exp) => (
    <ExperienceCard key={exp.id} experience={exp} craft={exp.craft} />
  ));

  const upcomingCount = items.filter((it) => !it.isEnded).length;

  return (
    <div className="pat-asanoha-soft">
      <div className="mx-auto max-w-wide px-6 pb-section-sm pt-14 md:px-12 md:pb-section md:pt-20">
        <PageHero
          kicker={t('heroKicker')}
          title={t.rich('heroHeading', {
            em: (chunks) => <em className="mark-gold not-italic">{chunks}</em>,
          })}
          en={t('heroEn')}
          aside={
            <Stat
              className="rounded-md bg-surface px-8 py-5 shadow-card sm:grid-cols-3"
              items={[
                { value: upcomingCount, label: t('statUpcoming') },
                { value: experiences.length, label: t('statAnytime') },
                { value: crafts.length, label: t('statCrafts') },
              ]}
            />
          }
        />

        <div className="mt-10">
          <Suspense fallback={<FallbackList items={items} />}>
            <EventsView
              items={items}
              crafts={filterCrafts}
              experienceNodes={experienceNodes}
              today={todayISO()}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

/**
 * Suspense fallback（＝プリレンダリング時の内容）。開催予定を月グルーピングして出し、
 * SEO と初期表示を確保する（`EventsView` と同じ `groupEventsByMonth` を使う）。
 */
function FallbackList({ items }: { items: EventCalendarItem[] }) {
  const groups = groupEventsByMonth(items.filter((it) => !it.isEnded));
  return (
    <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-16">
      <div className="min-w-0">
        {groups.map((group) => (
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
        ))}
      </div>
    </div>
  );
}
