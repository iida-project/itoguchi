import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import type { Availability, ExperienceItem } from '@/lib/data/types';

type ExperienceCardProps = {
  experience: ExperienceItem;
  /** 一覧（docs/07）では所属工芸へのリンクを出す。工芸詳細では省略 */
  craft?: { slug: string; name: string } | null;
  className?: string;
};

const AVAILABILITY_KEY: Record<Availability, string> = {
  anytime: 'availabilityAnytime',
  seasonal: 'availabilitySeasonal',
  request: 'availabilityRequest',
};

/**
 * 体験カード（DESIGN.md §5.4）。**淡藤の面のカード**で、日付ブロックの代わりに
 * 受付形態を金のタグで示す。イベント（日付あり）との区別を面の色で付ける。
 *
 * カレンダーのサイドバー「随時受付の体験」と体験一覧（3 列グリッド）が同じ部品を使う
 * （DESIGN §6 外挿ルール: 体験一覧はサイドバーの随時受付カードを 3 列に拡大したもの）。
 */
export async function ExperienceCard({
  experience,
  craft,
  className,
}: ExperienceCardProps) {
  const [t, tCommon] = await Promise.all([
    getTranslations('Experiences'),
    getTranslations('Common'),
  ]);

  const meta: Array<{ label: string; value: string }> = [];
  if (experience.durationNote) {
    meta.push({ label: t('duration'), value: experience.durationNote });
  }
  if (experience.seasonNote) {
    meta.push({ label: t('season'), value: experience.seasonNote });
  }
  if (experience.applyMethod) {
    meta.push({ label: t('apply'), value: experience.applyMethod });
  }

  return (
    <article
      className={cn(
        'relative flex flex-col rounded-md bg-primary-100 p-5 transition-[transform,box-shadow] duration-250 ease-out hover:-translate-y-0.5 hover:shadow-card',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        {/* 受付形態は金の小さな面（§1「金は構造の目印」） */}
        <span className="inline-flex items-center rounded-full bg-gold-600 px-2.5 py-1 font-en text-[10px] uppercase tracking-[0.16em] text-white">
          {t(AVAILABILITY_KEY[experience.availability])}
        </span>
        {craft && (
          <Link
            href={`/crafts/${craft.slug}`}
            className="text-[12px] font-semibold text-primary-700 hover:underline"
          >
            {craft.name}
          </Link>
        )}
      </div>

      {experience.title && <h3 className="mt-2.5 font-display text-h4">{experience.title}</h3>}
      {experience.description && (
        <p className="mt-1.5 text-[12px] leading-[1.7] text-muted">{experience.description}</p>
      )}

      {meta.length > 0 && (
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-caption">
          {meta.map((m) => (
            <div key={m.label} className="contents">
              <dt className="text-muted">{m.label}</dt>
              <dd>{m.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-3 flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
        {experience.priceNote && (
          <span className="font-en text-[15px] font-medium text-primary-700">
            {experience.priceNote}
          </span>
        )}
        {experience.isProvisional && (
          <span className="text-caption text-muted">{tCommon('provisional')}</span>
        )}
      </div>

      {experience.group?.name && (
        <p className="mt-2 text-caption text-muted">{experience.group.name}</p>
      )}
    </article>
  );
}
