import { addStep } from './actions';
import { StepCard } from './StepCard';
import { buttonClasses } from '@/components/ui/buttonStyles';
import type { CraftStepEdit } from '@/lib/admin/data/crafts';

/** 工芸編集ページの工程サブエディタ（docs/12）。追加/並び替え/削除は 1 行アクション。 */
export function StepsEditor({
  craftId,
  steps,
  genKey,
}: {
  craftId: string;
  steps: CraftStepEdit[];
  genKey?: string;
}) {
  return (
    <section className="mt-12">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-jp text-h3 text-foreground">工程</h2>
        <form action={addStep.bind(null, craftId)}>
          <button type="submit" className={buttonClasses({ variant: 'secondary', size: 'md' })}>
            工程を追加
          </button>
        </form>
      </div>

      {steps.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border-strong bg-surface px-4 py-8 text-center text-muted">
          工程がありません。「工程を追加」で作成してください。
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {steps.map((step, i) => (
            <StepCard
              key={`${step.base.id}-${genKey ?? 'base'}`}
              step={step}
              index={i}
              isFirst={i === 0}
              isLast={i === steps.length - 1}
              initialTab={genKey ? 'en' : 'ja'}
            />
          ))}
        </div>
      )}
    </section>
  );
}
