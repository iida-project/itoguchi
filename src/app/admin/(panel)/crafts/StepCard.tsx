'use client';

import { useActionState } from 'react';
import { updateStep, moveStep, deleteStep, generateStepEn } from './actions';
import { GenerateEnButton } from '@/components/admin/GenerateEnButton';
import { initialFormState, type FormState } from '@/lib/admin/validate';
import { Field } from '@/components/admin/form/Field';
import { TextInput } from '@/components/admin/form/TextInput';
import { TextArea } from '@/components/admin/form/TextArea';
import { Checkbox } from '@/components/admin/form/Checkbox';
import { SubmitButton } from '@/components/admin/form/SubmitButton';
import { FormStatus } from '@/components/admin/form/FormStatus';
import { TranslationTabs } from '@/components/admin/form/TranslationTabs';
import { ImageField } from '@/components/admin/form/ImageField';
import { DeleteButton } from '@/components/admin/DeleteButton';
import type { CraftStepEdit } from '@/lib/admin/data/crafts';

const moveBtn =
  'flex h-8 w-8 items-center justify-center rounded-md border border-border-strong text-foreground transition-colors hover:bg-warm disabled:opacity-40 disabled:hover:bg-transparent';

export function StepCard({
  step,
  index,
  isFirst,
  isLast,
  initialTab,
}: {
  step: CraftStepEdit;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  initialTab?: 'ja' | 'en';
}) {
  const [state, action] = useActionState<FormState, FormData>(updateStep, initialFormState);

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-jp text-h4 text-foreground">工程 {index + 1}</h3>
        <div className="flex items-center gap-2">
          <form action={moveStep.bind(null, step.base.id, 'up')}>
            <button type="submit" disabled={isFirst} className={moveBtn} aria-label="上へ">
              ↑
            </button>
          </form>
          <form action={moveStep.bind(null, step.base.id, 'down')}>
            <button type="submit" disabled={isLast} className={moveBtn} aria-label="下へ">
              ↓
            </button>
          </form>
          <GenerateEnButton
            action={generateStepEn.bind(null, step.base.id)}
            hasEn={Boolean(step.en)}
            showHint={false}
          />
          <DeleteButton
            action={deleteStep.bind(null, step.base.id)}
            confirmMessage="この工程を削除します。よろしいですか？"
          />
        </div>
      </div>

      <form action={action} className="flex flex-col gap-5">
        <FormStatus ok={state.ok} error={state.error} />
        <input type="hidden" name="step_id" value={step.base.id} />

        <ImageField name="image" label="工程画像" currentUrl={step.base.image_url} />
        <Checkbox label="仮情報（※確認中）" name="is_provisional" defaultChecked={step.base.is_provisional} />

        <TranslationTabs defaultTab={initialTab}>
          {(loc) => {
            const t = loc === 'ja' ? step.ja : step.en;
            return (
              <div className="flex flex-col gap-4">
                <Field label="タイトル">
                  <TextInput name={`${loc}_title`} defaultValue={t?.title ?? ''} />
                </Field>
                <Field label="説明">
                  <TextArea name={`${loc}_description`} rows={4} defaultValue={t?.description ?? ''} />
                </Field>
                <Field label="画像の代替テキスト">
                  <TextInput name={`${loc}_image_alt`} defaultValue={t?.image_alt ?? ''} />
                </Field>
                <div className="flex flex-wrap gap-6">
                  <Checkbox
                    label="この言語を公開"
                    name={`${loc}_is_published`}
                    defaultChecked={t?.is_published ?? false}
                  />
                  <Checkbox
                    label="仮情報"
                    name={`${loc}_is_provisional`}
                    defaultChecked={t?.is_provisional ?? false}
                  />
                </div>
              </div>
            );
          }}
        </TranslationTabs>

        <div>
          <SubmitButton>この工程を保存</SubmitButton>
        </div>
      </form>
    </div>
  );
}
