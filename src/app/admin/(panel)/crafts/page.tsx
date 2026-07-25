import { listCrafts } from '@/lib/admin/data/crafts';
import { publishedLocales } from '@/lib/admin/data/_shared';
import { AdminPageHeader, AdminTable, type AdminTableRow } from '@/components/admin/AdminTable';
import { PublishBadges } from '@/components/admin/PublishBadges';
import { Badge } from '@/components/ui/Badge';

export default async function CraftsListPage() {
  const crafts = await listCrafts();
  const rows: AdminTableRow[] = crafts.map((c) => {
    const jaName = c.translations.find((t) => t.locale === 'ja')?.name ?? c.slug;
    return {
      id: c.id,
      href: `/admin/crafts/${c.id}`,
      cells: [
        jaName,
        c.slug,
        c.status === 'published' ? (
          <Badge key="st" variant="success">公開</Badge>
        ) : (
          <span key="st" className="text-caption text-muted">下書き</span>
        ),
        <PublishBadges key="pub" locales={publishedLocales(c.translations)} />,
        c.is_provisional ? <Badge key="prov" variant="gold">仮</Badge> : '—',
      ],
    };
  });

  return (
    <div>
      <AdminPageHeader title="工芸" newHref="/admin/crafts/new" />
      <AdminTable columns={['名称', 'slug', '公開状態', '翻訳公開', '仮']} rows={rows} />
    </div>
  );
}
