import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { getCrafts, getEvents, getExperiences } from '@/lib/data';
import { todayISO } from '@/lib/date';
import { EventRow } from '@/components/events/EventRow';
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
      node: <EventRow event={event} locale={locale as Locale} craft={craft} />,
    };
  });

  // 工芸チップは「イベントを持つ工芸」だけ
  const eventCraftSlugs = new Set(items.map((it) => it.craftSlug).filter(Boolean));
  const filterCrafts = crafts
    .filter((c) => eventCraftSlugs.has(c.slug))
    .map((c) => ({ slug: c.slug, name: c.name }));

  // 空状態（空月/開催予定なし）に併記する随時受付の体験
  const experienceNodes = experiences.map((exp) => (
    <ExperienceCard key={exp.id} experience={exp} craft={exp.craft} />
  ));

  return (
    <div className="mx-auto max-w-content px-6 py-section-sm md:py-section">
      <header className="mb-8">
        <h1 className="text-display">{t('listTitle')}</h1>
        <p className="mt-3 max-w-reading text-body-lg text-muted">{t('lead')}</p>
      </header>

      <Suspense fallback={<FallbackList items={items} />}>
        <EventsView
          items={items}
          crafts={filterCrafts}
          experienceNodes={experienceNodes}
          today={todayISO()}
        />
      </Suspense>
    </div>
  );
}

// Suspense fallback（＝プリレンダリング時の内容）。開催予定を出して SEO/初期表示を確保
function FallbackList({ items }: { items: EventCalendarItem[] }) {
  const upcoming = items.filter((it) => !it.isEnded);
  return (
    <ul className="flex flex-col gap-4">
      {upcoming.map((it) => (
        <li key={it.id}>{it.node}</li>
      ))}
    </ul>
  );
}
