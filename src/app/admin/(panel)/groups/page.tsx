import { listGroups } from '@/lib/admin/data/groups';
import { publishedLocales } from '@/lib/admin/data/_shared';
import { AdminPageHeader, AdminTable, type AdminTableRow } from '@/components/admin/AdminTable';
import { PublishBadges } from '@/components/admin/PublishBadges';
import { Badge } from '@/components/ui/Badge';

export default async function GroupsListPage() {
  const groups = await listGroups();
  const rows: AdminTableRow[] = groups.map((g) => {
    const jaName = g.translations.find((t) => t.locale === 'ja')?.name ?? g.slug;
    return {
      id: g.id,
      href: `/admin/groups/${g.id}`,
      cells: [
        jaName,
        g.slug,
        <PublishBadges key="pub" locales={publishedLocales(g.translations)} />,
        g.is_provisional ? <Badge key="prov" variant="gold">仮</Badge> : '—',
      ],
    };
  });

  return (
    <div>
      <AdminPageHeader title="担い手" newHref="/admin/groups/new" />
      <AdminTable columns={['名称', 'slug', '公開', '仮']} rows={rows} />
    </div>
  );
}
