import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { CardMedia } from '@/components/ui/Card';
import type { CraftListItem } from '@/lib/data/types';

type CraftCardProps = {
  craft: CraftListItem;
  /** 1 始まりの通し番号。`No. 01` として写真左上に出す（§5.2） */
  index?: number;
};

const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * 工芸カード（DESIGN.md §5.2）。写真 4:3 + 工芸名 + 地域 + tagline 1 行。
 * ホーム（docs/05）と工芸一覧（docs/06）で共用。カード全体が正本ページへのリンク。
 *
 * v0.2: **通し番号のピル**を写真左上に置き（工芸が「収蔵品」として並ぶ感じを出す）、
 * テキスト部はカード枠を持たず背景に直置きする（枠で囲うと重くなる）。
 */
export async function CraftCard({ craft, index }: CraftCardProps) {
  const t = await getTranslations('Common');

  return (
    <Link href={`/crafts/${craft.slug}`} className="group block">
      <div className="relative overflow-hidden rounded-lg transition-[transform,box-shadow] duration-300 ease-out group-hover:-translate-y-1.5 group-hover:shadow-deep">
        <CardMedia
          src={craft.heroImageUrl}
          alt={craft.name}
          aspectClassName="aspect-[4/3]"
          className="rounded-lg"
          placeholderLabel={index ? `No. ${pad2(index)}` : undefined}
          placeholderNote={craft.name}
        />
        {/* 通し番号のピルは写真の上に置くもの。プレースホルダには既に番号が入るので出さない */}
        {index && craft.heroImageUrl && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 font-en text-[12px] italic tracking-[0.1em] text-primary-700">
            No. {pad2(index)}
          </span>
        )}
      </div>

      <div className="pt-4">
        <div className="flex flex-wrap items-baseline gap-x-2.5">
          <h3 className="font-display text-h3">{craft.name}</h3>
          {craft.region && <span className="text-caption text-muted">{craft.region}</span>}
        </div>
        {craft.nameLatin && (
          <p className="mt-1 font-en text-[13px] italic tracking-[0.06em] text-muted [font-synthesis:none]">
            {craft.nameLatin}
          </p>
        )}
        {craft.tagline && <p className="mt-2 line-clamp-1 text-body">{craft.tagline}</p>}
        {craft.isProvisional && (
          <p className="mt-1 text-caption text-muted">{t('provisional')}</p>
        )}
      </div>
    </Link>
  );
}
