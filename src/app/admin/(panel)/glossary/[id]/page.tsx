import { notFound } from 'next/navigation';
import { getGlossary } from '@/lib/admin/data/glossary';
import { GlossaryForm } from '../GlossaryForm';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { deleteGlossary } from '../actions';

export default async function EditGlossaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getGlossary(id);
  if (!row) notFound();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-jp text-h2 text-foreground">用語集 — 編集</h1>
        <DeleteButton action={deleteGlossary.bind(null, row.id)} />
      </div>
      <GlossaryForm initial={row} />
    </div>
  );
}
