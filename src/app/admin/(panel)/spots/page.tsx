import { listSpots } from '@/lib/admin/data/spots';
import { listCraftOptions } from '@/lib/admin/data/options';
import { publishedLocales } from '@/lib/admin/data/_shared';
import { AdminPageHeader, AdminTable, type AdminTableRow } from '@/components/admin/AdminTable';
import { PublishBadges } from '@/components/admin/PublishBadges';

const TYPE_LABELS: Record<string, string> = { shop: '店舗', museum: '資料館・館', other: 'その他' };

export default async function SpotsListPage() {
  const [spots, crafts] = await Promise.all([listSpots(), listCraftOptions()]);
  const craftLabel = new Map(crafts.map((c) => [c.id, c.label]));

  const rows: AdminTableRow[] = spots.map((s) => {
    const jaName = s.translations.find((t) => t.locale === 'ja')?.name ?? '（名称未設定）';
    return {
      id: s.id,
      href: `/admin/spots/${s.id}`,
      cells: [
        jaName,
        craftLabel.get(s.craft_id) ?? '—',
        TYPE_LABELS[s.type] ?? s.type,
        <PublishBadges key="pub" locales={publishedLocales(s.translations)} />,
      ],
    };
  });

  return (
    <div>
      <AdminPageHeader title="スポット" newHref="/admin/spots/new" />
      <AdminTable columns={['名称', '工芸', '種別', '公開']} rows={rows} />
    </div>
  );
}
