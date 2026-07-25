import { notFound } from 'next/navigation';
import { getGroup } from '@/lib/admin/data/groups';
import { GroupForm } from '../GroupForm';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { deleteGroup } from '../actions';

export default async function EditGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = await getGroup(id);
  if (!group) notFound();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-jp text-h2 text-foreground">担い手 — 編集</h1>
        <DeleteButton action={deleteGroup.bind(null, group.base.id)} />
      </div>
      <GroupForm initial={group} />
    </div>
  );
}
