import { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ui/Badge';
import { buttonClasses } from '@/components/ui/buttonStyles';
import { cn } from '@/lib/cn';
import { formatDate } from '@/lib/date';
import type { Locale } from '@/i18n/routing';
import type { EventDetail } from '@/lib/data/types';

type EventApplyCardProps = {
  event: EventDetail;
  locale: Locale;
  className?: string;
};

/**
 * イベント詳細の追従申込カード（DESIGN.md §5.12 の型を借りる）。
 * 工芸詳細の `CraftExperienceCard` と同じ体裁（白カード + 金の点付き見出し + 幅 100% の Primary）で、
 * 中身を「この回の日時・会場・料金・申込」に差し替えたもの。
 *
 * 申込リンクは外部サイトへ出るため、**遷移先が外部であることをラベルで明示**する（§5.1）。
 * 終了イベントは申込を出さずアーカイブ表示にする（削除はしない。REQUIREMENTS §7）。
 */
export async function EventApplyCard({ event, locale, className }: EventApplyCardProps) {
  const [t, tCommon] = await Promise.all([
    getTranslations('Events'),
    getTranslations('Common'),
  ]);

  const dateText =
    formatDate(event.startDate, locale) +
    (event.endDate && event.endDate !== event.startDate
      ? ` – ${formatDate(event.endDate, locale)}`
      : '');

  const rows: Array<{ label: string; value: string }> = [
    { label: t('dateLabel'), value: dateText + (event.timeNote ? `　${event.timeNote}` : '') },
  ];
  if (event.venue) rows.push({ label: t('venueLabel'), value: event.venue });
  if (event.feeNote) rows.push({ label: t('feeLabel'), value: event.feeNote });
  if (event.capacityNote) rows.push({ label: t('capacityLabel'), value: event.capacityNote });

  return (
    <div className={cn('rounded-lg border border-border bg-surface p-6 shadow-card', className)}>
      <h2 className="flex items-center gap-2 font-display text-h4">
        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-600" />
        {t('applyCardTitle')}
      </h2>
      <p className="mb-5 mt-1 font-en text-[12px] italic text-muted [font-synthesis:none]">
        {t('applyCardEn')}
      </p>

      <dl className="mb-5 flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.label} className="rounded-md border border-border p-3.5">
            <dt className="font-en text-[11px] uppercase tracking-[0.1em] text-muted">
              {row.label}
            </dt>
            <dd className="mt-1 font-display text-[14px] font-semibold">{row.value}</dd>
          </div>
        ))}
      </dl>

      {event.isEnded ? (
        <div className="flex flex-col items-start gap-2">
          <Badge variant="ended">{t('statusEnded')}</Badge>
          <p className="text-caption text-muted">{t('applyCardEnded')}</p>
        </div>
      ) : (
        <>
          {event.applyUrl && (
            <a
              href={event.applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses({ className: 'w-full' })}
            >
              {t('applyButton')} <span aria-hidden="true">↗</span>
            </a>
          )}
          {event.applyNote && (
            <p className={cn('text-caption leading-[1.7]', event.applyUrl && 'mt-3')}>
              {event.applyNote}
            </p>
          )}
        </>
      )}

      {event.isProvisional && (
        <p className="mt-3 text-caption text-muted">{tCommon('provisional')}</p>
      )}
    </div>
  );
}
