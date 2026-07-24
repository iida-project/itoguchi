import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { cn } from '@/lib/cn';
import type { CraftDetail } from '@/lib/data/types';

type CraftHeroProps = {
  craft: CraftDetail;
  /** 1 始まりの通し番号（`No. 01 · Tōyama Fuji-ito` のプレート） */
  index?: number;
};

const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * 工芸詳細のヒーロー（DESIGN.md §6）。16:8 の大枠にタイトルを被せる。
 *
 * 写真はまだ 1 枚も無い（docs/15 まで）。**枠のアスペクト比は写真の有無で変えず**、
 * 写真が無いときは §9 のプレースホルダ（生成り濃 + 破線 + 麻の葉）にして
 * 文字を墨で置く。写真が入ったらスクリム + 白文字に切り替わるだけでレイアウトは動かない。
 *
 * SP ではタイトルブロックを枠の外（下）へ落とす（`static` → `lg:absolute` の 1 段切替）。
 * **タイトルブロックは 1 つだけ**にして、位置と配色をレスポンシブに切り替える
 * （PC/SP で 2 本立てにすると DOM に h1 が 2 つ並ぶため）。
 */
export async function CraftHero({ craft, index }: CraftHeroProps) {
  const t = await getTranslations('Crafts');
  const hasPhoto = Boolean(craft.heroImageUrl);

  // Origin（創業年）はスキーマに無いので出さない。データのある項目だけ並べる
  const metas = [
    craft.region ? { label: t('metaRegion'), value: craft.region } : null,
    craft.groups.length > 0 ? { label: t('metaMakers'), value: craft.groups[0].name } : null,
    craft.experiences.length > 0
      ? { label: t('metaExperiences'), value: `${pad2(craft.experiences.length)}` }
      : null,
  ].filter((m): m is { label: string; value: string } => m !== null);

  return (
    <div className="relative">
      <div
        className={cn(
          'relative aspect-[16/9] overflow-hidden rounded-lg sm:aspect-[16/8]',
          !hasPhoto && 'pat-asanoha-soft border border-dashed border-border-strong bg-warm',
        )}
      >
        {hasPhoto && (
          <>
            <Image
              src={craft.heroImageUrl as string}
              alt={craft.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-b from-transparent from-40% to-foreground/60"
            />
          </>
        )}

        {/* 通し番号プレート */}
        {(index || craft.nameLatin) && (
          <p className="absolute left-5 top-5 rounded-full bg-white/95 px-3.5 py-2 font-en text-[12px] italic tracking-[0.1em] text-primary-700 [font-synthesis:none] md:left-6 md:top-6">
            {[index ? `No. ${pad2(index)}` : null, craft.nameLatin]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}

      </div>

      {/*
        タイトルブロックは 1 つだけ置き、SP は枠の下（静的）／PC は枠の下端に被せる（絶対配置）
        と位置だけを切り替える。配色も PC で写真がある場合のみ白に転じる。
      */}
      <div
        className={cn(
          'mt-6 lg:absolute lg:inset-x-10 lg:bottom-10 lg:mt-0 lg:flex lg:items-end lg:justify-between lg:gap-8',
          hasPhoto && 'lg:text-white',
        )}
      >
        <div className="min-w-0">
          <h1 className="font-display text-display lg:leading-[1.1]">{craft.name}</h1>
          {craft.nameLatin && (
            <p className="mt-2 font-en text-[18px] italic text-muted [font-synthesis:none] lg:mt-3 lg:text-[22px] lg:text-inherit lg:opacity-90">
              {craft.nameLatin}
            </p>
          )}
          {craft.tagline && (
            <p className="mt-3 font-display text-lead text-primary-700 lg:max-w-[40ch] lg:text-[16px] lg:leading-relaxed lg:text-inherit">
              {craft.tagline}
            </p>
          )}
        </div>
        {metas.length > 0 && <MetaList metas={metas} onPhoto={hasPhoto} className="mt-5 lg:mt-0" />}
      </div>
    </div>
  );
}

function MetaList({
  metas,
  onPhoto,
  className,
}: {
  metas: Array<{ label: string; value: string }>;
  /** PC で写真の上に載る（＝白文字になる）かどうか。SP では常に枠外なので効かない */
  onPhoto: boolean;
  className?: string;
}) {
  return (
    <dl className={cn('flex shrink-0 flex-wrap gap-x-6 gap-y-3', className)}>
      {metas.map((meta) => (
        <div key={meta.label}>
          <dt
            className={cn(
              'font-en text-[11px] uppercase tracking-[0.1em] text-muted',
              onPhoto && 'lg:text-inherit lg:opacity-90',
            )}
          >
            {meta.label}
          </dt>
          <dd className="mt-1 font-display text-[18px] font-semibold">{meta.value}</dd>
        </div>
      ))}
    </dl>
  );
}
