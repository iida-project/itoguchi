import { listExperiences } from '@/lib/admin/data/experiences';
import { listCraftOptions } from '@/lib/admin/data/options';
import { publishedLocales } from '@/lib/admin/data/_shared';
import { AdminPageHeader, AdminTable, type AdminTableRow } from '@/components/admin/AdminTable';
import { PublishBadges } from '@/components/admin/PublishBadges';

const AVAILABILITY_LABELS: Record<string, string> = {
  anytime: '随時受付',
  seasonal: '季節限定',
  request: '要予約',
};

export default async function ExperiencesListPage() {
  const [experiences, crafts] = await Promise.all([listExperiences(), listCraftOptions()]);
  const craftLabel = new Map(crafts.map((c) => [c.id, c.label]));

  const rows: AdminTableRow[] = experiences.map((e) => {
    const jaTitle = e.translations.find((t) => t.locale === 'ja')?.title ?? '（タイトル未設定）';
    return {
      id: e.id,
      href: `/admin/experiences/${e.id}`,
      cells: [
        jaTitle,
        craftLabel.get(e.craft_id) ?? '—',
        AVAILABILITY_LABELS[e.availability] ?? e.availability,
        <PublishBadges key="pub" locales={publishedLocales(e.translations)} />,
      ],
    };
  });

  return (
    <div>
      <AdminPageHeader title="体験" newHref="/admin/experiences/new" />
      <AdminTable columns={['タイトル', '工芸', '受付形態', '公開']} rows={rows} />
    </div>
  );
}
