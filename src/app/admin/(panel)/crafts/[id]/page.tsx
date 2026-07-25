import { notFound } from 'next/navigation';
import { getCraft } from '@/lib/admin/data/crafts';
import { CraftForm } from '../CraftForm';
import { StepsEditor } from '../StepsEditor';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { deleteCraft } from '../actions';

export default async function EditCraftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const craft = await getCraft(id);
  if (!craft) notFound();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-jp text-h2 text-foreground">工芸 — 編集</h1>
        <DeleteButton action={deleteCraft.bind(null, craft.base.id)} />
      </div>
      <CraftForm initial={craft} />
      <StepsEditor craftId={craft.base.id} steps={craft.steps} />
    </div>
  );
}
