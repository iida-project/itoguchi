import { notFound } from 'next/navigation';
import { getCraft } from '@/lib/admin/data/crafts';
import { CraftForm } from '../CraftForm';
import { StepsEditor } from '../StepsEditor';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { GenerateEnButton } from '@/components/admin/GenerateEnButton';
import { deleteCraft, generateCraftEn } from '../actions';

// 英訳生成は Gemini 呼び出しを含むため実行時間の上限を延ばす（Vercel デプロイ用・docs/16）。
export const maxDuration = 60;

export default async function EditCraftPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ gen?: string }>;
}) {
  const { id } = await params;
  const { gen } = await searchParams;
  const craft = await getCraft(id);
  if (!craft) notFound();

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-jp text-h2 text-foreground">工芸 — 編集</h1>
        <div className="flex items-start gap-3">
          <GenerateEnButton action={generateCraftEn.bind(null, craft.base.id)} hasEn={Boolean(craft.en)} />
          <DeleteButton action={deleteCraft.bind(null, craft.base.id)} />
        </div>
      </div>
      <CraftForm key={gen ?? 'base'} initial={craft} initialTab={gen ? 'en' : 'ja'} />
      <StepsEditor craftId={craft.base.id} steps={craft.steps} genKey={gen} />
    </div>
  );
}
