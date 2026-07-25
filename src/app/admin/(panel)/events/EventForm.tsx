'use client';

import { useActionState } from 'react';
import { saveEvent } from './actions';
import { initialFormState, type FormState } from '@/lib/admin/validate';
import { Field } from '@/components/admin/form/Field';
import { TextInput } from '@/components/admin/form/TextInput';
import { TextArea } from '@/components/admin/form/TextArea';
import { Select } from '@/components/admin/form/Select';
import { Checkbox } from '@/components/admin/form/Checkbox';
import { SubmitButton } from '@/components/admin/form/SubmitButton';
import { FormStatus } from '@/components/admin/form/FormStatus';
import { TranslationTabs } from '@/components/admin/form/TranslationTabs';
import type { EventEdit } from '@/lib/admin/data/events';
import type { Option } from '@/lib/admin/data/options';

const STATUS_LABELS: Record<string, string> = { draft: '下書き', published: '公開', ended: '終了' };

export function EventForm({
  initial,
  craftOptions,
  groupOptions,
  initialTab,
}: {
  initial?: EventEdit;
  craftOptions: Option[];
  groupOptions: Option[];
  initialTab?: 'ja' | 'en';
}) {
  const [state, action] = useActionState<FormState, FormData>(saveEvent, initialFormState);
  const base = initial?.base;

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-6">
      <FormStatus ok={state.ok} error={state.error} />
      {base && <input type="hidden" name="id" value={base.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="slug" required error={state.fieldErrors?.slug}>
          <TextInput name="slug" defaultValue={base?.slug ?? ''} required />
        </Field>
        <Field label="公開状態" required error={state.fieldErrors?.status} hint="終了は end_date が過ぎると自動判定されます">
          <Select name="status" defaultValue={base?.status ?? 'draft'}>
            {(['draft', 'published', 'ended'] as const).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="所属工芸（任意）">
          <Select name="craft_id" defaultValue={base?.craft_id ?? ''}>
            <option value="">（なし）</option>
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

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="開始日" required error={state.fieldErrors?.start_date}>
          <TextInput name="start_date" type="date" defaultValue={base?.start_date ?? ''} required />
        </Field>
        <Field label="終了日（任意）" error={state.fieldErrors?.end_date}>
          <TextInput name="end_date" type="date" defaultValue={base?.end_date ?? ''} />
        </Field>
      </div>

      <Field label="時間メモ" hint="「10時頃〜」など自由記述">
        <TextInput name="time_note" defaultValue={base?.time_note ?? ''} />
      </Field>

      <Field label="会場">
        <TextInput name="venue" defaultValue={base?.venue ?? ''} />
      </Field>
      <Field label="住所">
        <TextInput name="address" defaultValue={base?.address ?? ''} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="緯度 (lat)">
          <TextInput name="lat" type="number" step="any" defaultValue={base?.lat ?? ''} />
        </Field>
        <Field label="経度 (lng)">
          <TextInput name="lng" type="number" step="any" defaultValue={base?.lng ?? ''} />
        </Field>
        <Field label="料金メモ">
          <TextInput name="fee_note" defaultValue={base?.fee_note ?? ''} />
        </Field>
        <Field label="定員メモ">
          <TextInput name="capacity_note" defaultValue={base?.capacity_note ?? ''} />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="申込 URL" error={state.fieldErrors?.apply_url}>
          <TextInput name="apply_url" type="url" defaultValue={base?.apply_url ?? ''} />
        </Field>
        <Field label="申込メモ">
          <TextInput name="apply_note" defaultValue={base?.apply_note ?? ''} />
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
