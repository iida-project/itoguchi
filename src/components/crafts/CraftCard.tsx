import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Card, CardMedia } from '@/components/ui/Card';
import type { CraftListItem } from '@/lib/data/types';

type CraftCardProps = {
  craft: CraftListItem;
};

/**
 * 工芸カード（DESIGN.md §5.2）。写真 4:3 + 工芸名 + 地域 + tagline 1 行。
 * ホーム（docs/05）と工芸一覧（docs/06）で共用。カード全体が正本ページへのリンク。
 */
export async function CraftCard({ craft }: CraftCardProps) {
  const t = await getTranslations('Common');

  return (
    <Link href={`/crafts/${craft.slug}`} className="block">
      <Card>
        <CardMedia src={craft.heroImageUrl} alt={craft.name} aspectClassName="aspect-[4/3]" />
        <div className="p-4">
          <h3 className="text-h3">{craft.name}</h3>
          {craft.region && (
            <p className="mt-1 text-caption text-muted">📍 {craft.region}</p>
          )}
          {craft.tagline && (
            <p className="mt-2 line-clamp-1 text-body">{craft.tagline}</p>
          )}
          {craft.isProvisional && (
            <p className="mt-2 text-caption text-muted">{t('provisional')}</p>
          )}
        </div>
      </Card>
    </Link>
  );
}
