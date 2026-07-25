import { notFound } from 'next/navigation';
import { getGroup } from '@/lib/admin/data/groups';
import { GroupForm } from '../GroupForm';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { GenerateEnButton } from '@/components/admin/GenerateEnButton';
import { deleteGroup, generateGroupEn } from '../actions';

export const maxDuration = 60;

export default async function EditGroupPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ gen?: string }>;
}) {
  const { id } = await params;
  const { gen } = await searchParams;
  const group = await getGroup(id);
  if (!group) notFound();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-jp text-h2 text-foreground">担い手 — 編集</h1>
        <div className="flex items-start gap-3">
          <GenerateEnButton action={generateGroupEn.bind(null, group.base.id)} hasEn={Boolean(group.en)} />
          <DeleteButton action={deleteGroup.bind(null, group.base.id)} />
        </div>
      </div>
      <GroupForm key={gen ?? 'base'} initial={group} initialTab={gen ? 'en' : 'ja'} />
    </div>
  );
}
