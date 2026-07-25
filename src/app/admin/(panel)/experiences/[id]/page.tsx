import { notFound } from 'next/navigation';
import { getExperience } from '@/lib/admin/data/experiences';
import { listCraftOptions, listGroupOptions } from '@/lib/admin/data/options';
import { ExperienceForm } from '../ExperienceForm';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { GenerateEnButton } from '@/components/admin/GenerateEnButton';
import { deleteExperience, generateExperienceEn } from '../actions';

export const maxDuration = 60;

export default async function EditExperiencePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ gen?: string }>;
}) {
  const { id } = await params;
  const { gen } = await searchParams;
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
        <div className="flex items-start gap-3">
          <GenerateEnButton
            action={generateExperienceEn.bind(null, experience.base.id)}
            hasEn={Boolean(experience.en)}
          />
          <DeleteButton action={deleteExperience.bind(null, experience.base.id)} />
        </div>
      </div>
      <ExperienceForm
        key={gen ?? 'base'}
        initial={experience}
        craftOptions={craftOptions}
        groupOptions={groupOptions}
        initialTab={gen ? 'en' : 'ja'}
      />
    </div>
  );
}
