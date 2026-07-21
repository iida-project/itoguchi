import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import { formatDateParts } from '@/lib/date';
import type { Locale } from '@/i18n/routing';
import type { EventListItem } from '@/lib/data/types';

type EventRowProps = {
  event: EventListItem;
  locale: Locale;
};

/**
 * イベントのリスト行（DESIGN.md §5.3）。左に淡藤の日付ブロック、右に横長の内容。
 * ホーム（docs/05）とイベント一覧（docs/08）で共用。行全体が詳細ページへのリンク。
 *
 * 受付状態（受付中/満員）を表すフィールドはデータモデルに無いため、開催予定イベントに
 * 「受付中」バッジは付けない（誤情報回避）。終了イベントのみ「終了」バッジ＋トーンダウン表示。
 */
export async function EventRow({ event, locale }: EventRowProps) {
  const [tEvents, tCommon] = await Promise.all([
    getTranslations('Events'),
    getTranslations('Common'),
  ]);

  const { month, day, weekday } = formatDateParts(event.startDate, locale);

  // メタ行: 会場・料金のうち存在するものだけを ・ で連結
  const meta: string[] = [];
  if (event.venue) meta.push(`📍 ${event.venue}`);
  if (event.feeNote) meta.push(`💴 ${event.feeNote}`);

  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn(
        'group flex overflow-hidden rounded-lg bg-surface shadow-card transition-shadow duration-300 hover:shadow-hover',
        event.isEnded && 'opacity-70 grayscale',
      )}
    >
      {/* 日付ブロック（視線のアンカー） */}
      <div className="flex w-20 shrink-0 flex-col items-center justify-center bg-primary-100 px-2 py-4 text-center">
        <span className="text-caption text-primary-700">{month}</span>
        <span className="font-display text-h2 leading-none text-primary-700">
          {day}
        </span>
        <span className="text-caption text-muted">{weekday}</span>
      </div>

      {/* 内容 */}
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-h3">{event.title}</h3>
          {event.isEnded && <Badge variant="ended">{tEvents('statusEnded')}</Badge>}
        </div>
        {meta.length > 0 && (
          <p className="text-caption text-muted">{meta.join(' ・ ')}</p>
        )}
        {event.isProvisional && (
          <p className="text-caption text-muted">{tCommon('provisional')}</p>
        )}
      </div>
    </Link>
  );
}
