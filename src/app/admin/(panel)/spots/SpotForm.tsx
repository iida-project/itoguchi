'use client';

import { useActionState } from 'react';
import { saveSpot } from './actions';
import { initialFormState, type FormState } from '@/lib/admin/validate';
import { Field } from '@/components/admin/form/Field';
import { TextInput } from '@/components/admin/form/TextInput';
import { TextArea } from '@/components/admin/form/TextArea';
import { Select } from '@/components/admin/form/Select';
import { Checkbox } from '@/components/admin/form/Checkbox';
import { SubmitButton } from '@/components/admin/form/SubmitButton';
import { FormStatus } from '@/components/admin/form/FormStatus';
import { TranslationTabs } from '@/components/admin/form/TranslationTabs';
import type { SpotEdit } from '@/lib/admin/data/spots';
import type { Option } from '@/lib/admin/data/options';

const TYPE_LABELS: Record<string, string> = { shop: '店舗', museum: '資料館・館', other: 'その他' };

export function SpotForm({ initial, craftOptions }: { initial?: SpotEdit; craftOptions: Option[] }) {
  const [state, action] = useActionState<FormState, FormData>(saveSpot, initialFormState);
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
        <Field label="種別" required error={state.fieldErrors?.type}>
          <Select name="type" defaultValue={base?.type ?? 'shop'}>
            {(['shop', 'museum', 'other'] as const).map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </Field>
      </div>

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
      </div>

      <Field label="URL" error={state.fieldErrors?.url}>
        <TextInput name="url" type="url" defaultValue={base?.url ?? ''} />
      </Field>

      <Checkbox label="仮情報（※確認中）" name="is_provisional" defaultChecked={base?.is_provisional ?? false} />

      <TranslationTabs>
        {(loc) => {
          const t = loc === 'ja' ? initial?.ja : initial?.en;
          return (
            <div className="flex flex-col gap-5">
              <Field
                label="名称"
                required={loc === 'ja'}
                error={loc === 'ja' ? state.fieldErrors?.ja_name : undefined}
              >
                <TextInput name={`${loc}_name`} defaultValue={t?.name ?? ''} />
              </Field>
              <Field label="紹介文">
                <TextArea name={`${loc}_description`} rows={4} defaultValue={t?.description ?? ''} />
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
