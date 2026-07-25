'use client';

import { useActionState } from 'react';
import { saveExperience } from './actions';
import { initialFormState, type FormState } from '@/lib/admin/validate';
import { Field } from '@/components/admin/form/Field';
import { TextInput } from '@/components/admin/form/TextInput';
import { TextArea } from '@/components/admin/form/TextArea';
import { Select } from '@/components/admin/form/Select';
import { Checkbox } from '@/components/admin/form/Checkbox';
import { SubmitButton } from '@/components/admin/form/SubmitButton';
import { FormStatus } from '@/components/admin/form/FormStatus';
import { TranslationTabs } from '@/components/admin/form/TranslationTabs';
import type { ExperienceEdit } from '@/lib/admin/data/experiences';
import type { Option } from '@/lib/admin/data/options';

const AVAILABILITY_LABELS: Record<string, string> = {
  anytime: '随時受付',
  seasonal: '季節限定',
  request: '要予約（リクエスト）',
};

export function ExperienceForm({
  initial,
  craftOptions,
  groupOptions,
  initialTab,
}: {
  initial?: ExperienceEdit;
  craftOptions: Option[];
  groupOptions: Option[];
  initialTab?: 'ja' | 'en';
}) {
  const [state, action] = useActionState<FormState, FormData>(saveExperience, initialFormState);
  const base = initial?.base;

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-6">
      <FormStatus ok={state.ok} error={state.error} />
      {base && <input type="hidden" name="id" value={base.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="所属工芸" required error={state.fieldErrors?.craft_id}>
          <Select name="craft_id" defaultValue={base?.craft_id ?? ''} required>
            <option value="" disabled>
              選択してください
            </option>
            {craftOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="担い手（任意）">
          <Select name="group_id" defaultValue={base?.group_id ?? ''}>
            <option value="">（なし）</option>
            {groupOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="受付形態" required error={state.fieldErrors?.availability}>
        <Select name="availability" defaultValue={base?.availability ?? 'anytime'}>
          {(['anytime', 'seasonal', 'request'] as const).map((a) => (
            <option key={a} value={a}>
              {AVAILABILITY_LABELS[a]}
            </option>
          ))}
        </Select>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="料金メモ">
          <TextInput name="price_note" defaultValue={base?.price_note ?? ''} />
        </Field>
        <Field label="所要時間メモ">
          <TextInput name="duration_note" defaultValue={base?.duration_note ?? ''} />
        </Field>
        <Field label="時期メモ">
          <TextInput name="season_note" defaultValue={base?.season_note ?? ''} />
        </Field>
        <Field label="申込方法">
          <TextInput name="apply_method" defaultValue={base?.apply_method ?? ''} />
        </Field>
      </div>

      <Checkbox label="仮情報（※確認中）" name="is_provisional" defaultChecked={base?.is_provisional ?? false} />

      <TranslationTabs defaultTab={initialTab}>
        {(loc) => {
          const t = loc === 'ja' ? initial?.ja : initial?.en;
          return (
            <div className="flex flex-col gap-5">
              <Field
                label="タイトル"
                required={loc === 'ja'}
                error={loc === 'ja' ? state.fieldErrors?.ja_title : undefined}
              >
                <TextInput name={`${loc}_title`} defaultValue={t?.title ?? ''} />
              </Field>
              <Field label="説明">
                <TextArea name={`${loc}_description`} rows={5} defaultValue={t?.description ?? ''} />
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
        <SubmitButton />
      </div>
    </form>
  );
}
