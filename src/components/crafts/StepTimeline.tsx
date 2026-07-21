import { CardMedia } from '@/components/ui/Card';
import { Reveal } from '@/components/ui/Reveal';
import type { CraftStepItem } from '@/lib/data/types';

type StepTimelineProps = {
  steps: CraftStepItem[];
};

/**
 * 工程タイムライン（DESIGN §5.5・★シグネチャー）。
 * 縦 1px の藤紫の糸を背骨に、各工程を結び目＋写真＋説明で表す。
 * スクロールで各工程が fade-in-up（Reveal の stagger）。写真未許可時は淡藤プレースホルダ枠。
 */
export function StepTimeline({ steps }: StepTimelineProps) {
  if (steps.length === 0) return null;

  return (
    <ol className="relative">
      {/* 背骨の糸（結び目の中心 = left 7px に合わせる） */}
      <span
        aria-hidden="true"
        className="absolute bottom-2 left-[7px] top-2 w-px bg-primary-400"
      />
      {steps.map((step, i) => (
        <li key={step.id} className="relative flex gap-5 pb-10 last:pb-0">
          {/* 結び目 */}
          <span
            aria-hidden="true"
            className="relative z-10 mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-primary-400 bg-primary-600"
          />
          <Reveal index={i} className="min-w-0 flex-1">
            <div className="max-w-md">
              <CardMedia
                src={step.imageUrl}
                alt={step.imageAlt ?? ''}
                aspectClassName="aspect-[4/3]"
                sizes="(max-width: 640px) 100vw, 28rem"
              />
            </div>
            <p className="mt-3 text-caption font-medium text-primary-700">
              STEP {step.position}
            </p>
            {step.title && <h3 className="mt-1 text-h3">{step.title}</h3>}
            {step.description && (
              <p className="mt-2 text-body text-muted">{step.description}</p>
            )}
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
