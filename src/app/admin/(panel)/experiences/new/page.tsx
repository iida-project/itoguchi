import { ExperienceForm } from '../ExperienceForm';
import { listCraftOptions, listGroupOptions } from '@/lib/admin/data/options';

export default async function NewExperiencePage() {
  const [craftOptions, groupOptions] = await Promise.all([listCraftOptions(), listGroupOptions()]);
  return (
    <div>
      <h1 className="mb-6 font-jp text-h2 text-foreground">体験 — 新規作成</h1>
      <ExperienceForm craftOptions={craftOptions} groupOptions={groupOptions} />
    </div>
  );
}
