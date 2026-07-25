import { notFound } from 'next/navigation';
import { getExperience } from '@/lib/admin/data/experiences';
import { listCraftOptions, listGroupOptions } from '@/lib/admin/data/options';
import { ExperienceForm } from '../ExperienceForm';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { deleteExperience } from '../actions';

export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [experience, craftOptions, groupOptions] = await Promise.all([
    getExperience(id),
    listCraftOptions(),
    listGroupOptions(),
  ]);
  if (!experience) notFound();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-jp text-h2 text-foreground">体験 — 編集</h1>
        <DeleteButton action={deleteExperience.bind(null, experience.base.id)} />
      </div>
      <ExperienceForm initial={experience} craftOptions={craftOptions} groupOptions={groupOptions} />
    </div>
  );
}
