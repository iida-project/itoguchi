import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LinkButton } from '@/components/ui/LinkButton';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/date';
import type { Locale } from '@/i18n/routing';
import type { EventListItem, ExperienceItem } from '@/lib/data/types';

type CraftExperienceCardProps = {
  events: EventListItem[];
  experiences: ExperienceItem[];
  locale: Locale;
  /** 「すべての体験を見る」の遷移先を工芸で絞りたい場合に渡す */
  craftSlug?: string;
  className?: string;
};

const DIGEST_LIMIT = 3;

/**
 * 工芸詳細の追従サイドバーカード（DESIGN.md §5.12）。Airbnb の予約カード相当。
 *
 * 役割分担: **サイドバー = いつでも申し込める入口**（直近 2〜3 件のダイジェスト）/
 * 本文の「体験する」セクション = 詳細一覧。両方を残すのが §6 の指定。
 */
export async function CraftExperienceCard({
  events,
  experiences,
  locale,
  craftSlug,
  className,
}: CraftExperienceCardProps) {
  const [t, tExp] = await Promise.all([
    getTranslations('Crafts'),
    getTranslations('Experiences'),
  ]);

  // 日付の決まったイベントを先に、余りを随時受付の体験で埋める
  const eventItems = events.slice(0, DIGEST_LIMIT).map((event) => ({
    key: event.id,
    href: `/events/${event.slug}` as const,
    date: formatDate(event.startDate, locale),
    title: event.title,
    meta: [event.venue, event.timeNote, event.capacityNote].filter(Boolean).join(' · '),
    fee: event.feeNote,
  }));

  const experienceItems = experiences
    .slice(0, Math.max(0, DIGEST_LIMIT - eventItems.length))
    .map((exp) => ({
      key: exp.id,
      href: null,
      date: tExp('availabilityAnytime'),
      title: exp.title ?? '',
      meta: [exp.group?.name, exp.durationNote].filter(Boolean).join(' · '),
      fee: exp.priceNote,
    }));

  const items = [...eventItems, ...experienceItems];
  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface p-6 shadow-card',
        className,
      )}
    >
      <h2 className="flex items-center gap-2 font-display text-h4">
        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-600" />
        {t('sidebarTitle')}
      </h2>
      <p className="mb-5 mt-1 font-en text-[12px] italic text-muted [font-synthesis:none]">
        {t('sidebarEn')}
      </p>

      <ul className="mb-5 flex flex-col gap-3">
        {items.map((item) => {
          const body = (
            <>
              <span className="block font-display text-[14px] font-semibold text-primary-700">
                {item.date}
              </span>
              <span className="mt-1 block font-display text-[14px] font-semibold">
                {item.title}
              </span>
              {item.meta && (
                <span className="mt-1.5 block text-[11px] text-muted">{item.meta}</span>
              )}
              {item.fee && (
                <span className="mt-1 block font-en text-[16px] font-semibold">
                  {item.fee}
                </span>
              )}
            </>
          );

          return (
            <li key={item.key}>
              {item.href ? (
                <Link
                  href={item.href}
                  className="block rounded-md border border-border p-3.5 transition-colors duration-250 ease-out hover:border-primary-400"
                >
                  {body}
                </Link>
              ) : (
                <div className="rounded-md border border-border p-3.5">{body}</div>
              )}
            </li>
          );
        })}
      </ul>

      <LinkButton
        href={craftSlug ? `/experiences?craft=${craftSlug}` : '/experiences'}
        className="w-full"
      >
        {t('sidebarAll')} →
      </LinkButton>
    </div>
  );
}
