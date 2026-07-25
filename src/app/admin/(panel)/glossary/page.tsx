import { listGlossary } from '@/lib/admin/data/glossary';
import { AdminPageHeader, AdminTable, type AdminTableRow } from '@/components/admin/AdminTable';

export default async function GlossaryListPage() {
  const rows = await listGlossary();
  const tableRows: AdminTableRow[] = rows.map((g) => ({
    id: g.id,
    href: `/admin/glossary/${g.id}`,
    cells: [g.ja, g.en ?? '—', g.note ?? '—'],
  }));

  return (
    <div>
      <AdminPageHeader title="用語集" newHref="/admin/glossary/new" />
      <AdminTable columns={['用語（日本語）', '英訳', 'メモ']} rows={tableRows} />
    </div>
  );
}
