import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Badge } from '@/components/ui/Badge';
import { CardMedia } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import { formatDateParts } from '@/lib/date';
import type { Locale } from '@/i18n/routing';
import type { EventListItem } from '@/lib/data/types';

type EventRowProps = {
  event: EventListItem;
  locale: Locale;
  /** 一覧/カレンダー（docs/08）では所属工芸リンクを出す。ホーム/工芸詳細では省略 */
  craft?: { slug: string; name: string } | null;
  /**
   * `compact` = ホーム・工芸詳細（淡藤の日付ブロック + 円形矢印）
   * `list` = カレンダーページ（左罫 4px + 罫線のみの日付ブロック + 写真 + 料金/申込）
   * DESIGN §5.3「ホームでは淡藤の面、カレンダーページでは罫線のみ」
   */
  variant?: 'compact' | 'list';
};

/**
 * イベントのリスト行（DESIGN.md §5.3 ★案内係の中核）。
 *
 * タイトルリンクの ::after で行全体をクリック領域にしつつ、内側のリンクは z-10 で独立させ、
 * アンカーの入れ子を避ける（アクセシブル）。
 *
 * 受付状態（受付中/満員/残席）はデータモデルに無いため、開催予定に「受付中」は付けない。
 * 終了イベントのみ「終了」バッジ + トーンダウン表示（アーカイブとして残す）。
 */
export async function EventRow({
  event,
  locale,
  craft,
  variant = 'compact',
}: EventRowProps) {
  const [tEvents, tCommon] = await Promise.all([
    getTranslations('Events'),
    getTranslations('Common'),
  ]);

  const { month, day, weekday } = formatDateParts(event.startDate, locale);

  const meta: string[] = [];
  if (event.venue) meta.push(`📍 ${event.venue}`);
  if (event.timeNote) meta.push(`⏰ ${event.timeNote}`);
  if (event.capacityNote) meta.push(`👥 ${event.capacityNote}`);

  const title = (
    <h3 className="text-h3">
      <Link href={`/events/${event.slug}`} className="after:absolute after:inset-0">
        {event.title}
      </Link>
    </h3>
  );

  if (variant === 'list') {
    return (
      <article
        className={cn(
          // 左罫 4px は既定が藤紫、hover で金に変わり行が右へ 4px 動く（§5.3 / §7）
          // 料金は自由記述で長くなりうる（「2,000円（※確認中）」等）。CTA 列を固定幅にして
          // 本文が痩せないようにする
          'group relative grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-4 rounded-md border-l-4 border-primary-600 bg-surface p-5 transition-[transform,box-shadow,border-color] duration-250 ease-out hover:translate-x-1 hover:border-gold-600 hover:shadow-hover md:grid-cols-[92px_1fr_150px_150px] md:gap-6 md:p-6',
          event.isEnded && 'border-ended opacity-[0.72]',
        )}
      >
        {/* 日付ブロック（罫線のみ。面は敷かない） */}
        <div className="border-r border-border pr-4 text-center md:pr-5">
          <div className="font-en text-[12px] uppercase tracking-[0.16em] text-primary-600">
            {month}
          </div>
          <div className="my-1 font-jp text-[44px] font-bold leading-none text-primary-700">
            {day}
          </div>
          <div className="text-[11px] tracking-[0.1em] text-muted">{weekday}</div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            {title}
            {event.isEnded && <Badge variant="ended">{tEvents('statusEnded')}</Badge>}
            {craft && (
              <Link
                href={`/crafts/${craft.slug}`}
                className="relative z-10 rounded-full bg-primary-100 px-3 py-1 text-[12px] font-semibold tracking-[0.04em] text-primary-700 hover:underline"
              >
                {craft.name}
              </Link>
            )}
          </div>
          {meta.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-muted">
              {meta.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </div>
          )}
          {event.isProvisional && (
            <p className="mt-1 text-[12px] text-muted">{tCommon('provisional')}</p>
          )}
        </div>

        {/* 写真は SP では本文の下へ折り返す（§8） */}
        {/* SP では本文の下へ折り返す（§8）。幅を抑えてサムネイルとして見せる */}
        <div
          className={cn(
            'col-span-2 max-w-[200px] md:col-span-1 md:max-w-none',
            event.isEnded && 'grayscale',
          )}
        >
          <CardMedia src={null} aspectClassName="aspect-[3/2]" sizes="150px" />
        </div>

        <div className="col-span-2 flex items-center justify-between gap-4 md:col-span-1 md:block md:text-right">
          {event.feeNote && (
            <span className="block font-en text-[20px] leading-tight text-foreground">
              {event.feeNote}
            </span>
          )}
          {event.applyUrl ? (
            <a
              href={event.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 inline-block border-b border-gold-600 pb-0.5 text-[13px] font-semibold text-primary-600 md:mt-1.5"
            >
              {tEvents('applyShort')} →
            </a>
          ) : (
            <span className="text-[13px] text-muted md:mt-1.5 md:block">
              {tEvents('applyDetail')} →
            </span>
          )}
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        'group relative flex items-stretch overflow-hidden rounded-lg bg-surface shadow-card transition-[transform,box-shadow] duration-250 ease-out hover:translate-x-1 hover:shadow-hover',
        event.isEnded && 'opacity-70 grayscale',
      )}
    >
      {/* 日付ブロック（ホームは淡藤の面。§5.3） */}
      <div className="flex w-20 shrink-0 flex-col items-center justify-center bg-primary-100 px-2 py-4 text-center">
        <span className="font-en text-[11px] uppercase tracking-[0.14em] text-primary-600">
          {month}
        </span>
        <span className="font-jp text-[32px] font-bold leading-none text-primary-700">
          {day}
        </span>
        <span className="text-[11px] text-muted">{weekday}</span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-4 py-3">
        <div className="flex items-start justify-between gap-3">
          {title}
          {event.isEnded && <Badge variant="ended">{tEvents('statusEnded')}</Badge>}
        </div>
        {meta.length > 0 && (
          <p className="truncate text-caption text-muted">{meta.join(' ・ ')}</p>
        )}
        {event.isProvisional && (
          <p className="text-caption text-muted">{tCommon('provisional')}</p>
        )}
        {craft && (
          <Link
            href={`/crafts/${craft.slug}`}
            className="relative z-10 inline-block text-caption font-medium text-primary-700 hover:underline"
          >
            {craft.name} ▸
          </Link>
        )}
      </div>

      {/* 円形矢印（hover で淡藤 → 藤紫に反転。§7） */}
      <div className="hidden shrink-0 items-center pr-5 sm:flex">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-100 text-primary-700 transition-[background-color,color,transform] duration-250 ease-out group-hover:translate-x-1 group-hover:bg-primary-600 group-hover:text-white"
        >
          →
        </span>
      </div>
    </article>
  );
}
