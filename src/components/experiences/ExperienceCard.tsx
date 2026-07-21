import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { Availability, ExperienceItem } from '@/lib/data/types';

type ExperienceCardProps = {
  experience: ExperienceItem;
  /** 一覧（docs/07）では所属工芸へのリンクを出す。工芸詳細では省略 */
  craft?: { slug: string; name: string } | null;
};

const AVAILABILITY_KEY: Record<Availability, string> = {
  anytime: 'availabilityAnytime',
  seasonal: 'availabilitySeasonal',
  request: 'availabilityRequest',
};

/**
 * 体験カード（DESIGN §5.4）。イベントカードと似た構造だが、日付ブロックの代わりに
 * 受付形態バッジ（success 色）を出す。ホーム/工芸詳細（docs/05,06）と体験一覧（docs/07）で共用。
 */
export async function ExperienceCard({ experience, craft }: ExperienceCardProps) {
  const [t, tCommon] = await Promise.all([
    getTranslations('Experiences'),
    getTranslations('Common'),
  ]);

  // 料金/所要/時期/申込のうち存在するものだけをラベル付きで並べる
  const meta: Array<{ label: string; value: string }> = [];
  if (experience.priceNote) meta.push({ label: t('price'), value: experience.priceNote });
  if (experience.durationNote) meta.push({ label: t('duration'), value: experience.durationNote });
  if (experience.seasonNote) meta.push({ label: t('season'), value: experience.seasonNote });
  if (experience.applyMethod) meta.push({ label: t('apply'), value: experience.applyMethod });

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <Badge variant="success">{t(AVAILABILITY_KEY[experience.availability])}</Badge>
        {experience.isProvisional && (
          <span className="text-caption text-muted">{tCommon('provisional')}</span>
        )}
      </div>

      {craft && (
        <Link
          href={`/crafts/${craft.slug}`}
          className="mt-3 inline-block text-caption font-medium text-primary-700 hover:underline"
        >
          {craft.name}
        </Link>
      )}

      {experience.title && <h3 className="mt-2 text-h3">{experience.title}</h3>}
      {experience.description && (
        <p className="mt-2 text-body text-muted">{experience.description}</p>
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

      {experience.group?.name && (
        <p className="mt-3 text-caption text-muted">{experience.group.name}</p>
      )}
    </Card>
  );
}
