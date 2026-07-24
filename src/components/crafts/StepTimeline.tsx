import { getTranslations } from 'next-intl/server';
import { CardMedia } from '@/components/ui/Card';
import { Reveal } from '@/components/ui/Reveal';
import type { CraftStepItem } from '@/lib/data/types';

type StepTimelineProps = {
  steps: CraftStepItem[];
};

const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * 工程タイムライン（DESIGN §5.5・★シグネチャー）。
 * 縦 1px の藤紫の糸を背骨に、各工程を結び目 + 写真（4:3・左 300px）+ 説明で表す。
 *
 * v0.2: 結び目は**藤紫の芯 + 生成りの縁 + 金の外輪**（`box-shadow` の二重リング）。
 * 各工程は `Step 01` → 工程名 → 英字サブ → 説明の 4 層（§3.3 の英字併走）。
 */
export async function StepTimeline({ steps }: StepTimelineProps) {
  if (steps.length === 0) return null;
  const t = await getTranslations('Crafts');

  return (
    <ol className="relative pl-10">
      {/* 背骨の糸（結び目の中心 = left 16px に合わせる） */}
      <span
        aria-hidden="true"
        className="absolute bottom-4 left-4 top-4 w-px bg-primary-400"
      />
      {steps.map((step, i) => (
        <li key={step.id} className="relative mb-10 last:mb-0">
          {/* 結び目: 藤紫の芯 12px + 生成りの縁 4px + 金の外輪 1px */}
          <span
            aria-hidden="true"
            className="absolute -left-[30px] top-5 h-3 w-3 rounded-full bg-primary-600 shadow-[0_0_0_4px_var(--color-bg),0_0_0_5px_var(--color-gold-600)]"
          />
          <Reveal index={i}>
            {/* 3 カラムの中では本文列が痩せるので、写真は 200px に抑えて可読幅を確保する */}
            <div className="grid gap-5 md:grid-cols-[200px_1fr] md:gap-6">
              <CardMedia
                src={step.imageUrl}
                alt={step.imageAlt ?? ''}
                aspectClassName="aspect-[4/3]"
                sizes="(max-width: 768px) 100vw, 200px"
                placeholderLabel={`Step ${pad2(step.position)}`}
              />
              <div className="min-w-0">
                <p className="font-en text-[12px] uppercase italic tracking-[0.14em] text-gold-800 [font-synthesis:none]">
                  {t('stepKicker', { number: pad2(step.position) })}
                </p>
                {step.title && <h3 className="mt-1.5 font-display text-h3">{step.title}</h3>}
                {step.titleEn && (
                  <p className="mt-1 font-en text-[14px] italic text-muted [font-synthesis:none]">
                    {step.titleEn}
                  </p>
                )}
                {step.description && (
                  <p className="mt-3 text-body leading-[1.85]">{step.description}</p>
                )}
              </div>
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
