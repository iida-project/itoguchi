import { listArticles } from '@/lib/admin/data/articles';
import { listCraftOptions } from '@/lib/admin/data/options';
import { publishedLocales } from '@/lib/admin/data/_shared';
import { AdminPageHeader, AdminTable, type AdminTableRow } from '@/components/admin/AdminTable';
import { PublishBadges } from '@/components/admin/PublishBadges';
import { Badge } from '@/components/ui/Badge';

export default async function ArticlesListPage() {
  const [articles, crafts] = await Promise.all([listArticles(), listCraftOptions()]);
  const craftLabel = new Map(crafts.map((c) => [c.id, c.label]));

  const rows: AdminTableRow[] = articles.map((a) => {
    const jaTitle = a.translations.find((t) => t.locale === 'ja')?.title ?? a.slug;
    const published = Boolean(a.published_at) && new Date(a.published_at as string) <= new Date();
    return {
      id: a.id,
      href: `/admin/articles/${a.id}`,
      cells: [
        jaTitle,
        craftLabel.get(a.craft_id ?? '') ?? '—',
        published ? <Badge key="st" variant="success">公開</Badge> : <span key="st" className="text-caption text-muted">下書き</span>,
        <PublishBadges key="pub" locales={publishedLocales(a.translations)} />,
      ],
    };
  });

  return (
    <div>
      <AdminPageHeader title="記事" newHref="/admin/articles/new" />
      <AdminTable columns={['タイトル', '工芸', '記事公開', '翻訳公開']} rows={rows} />
    </div>
  );
}
