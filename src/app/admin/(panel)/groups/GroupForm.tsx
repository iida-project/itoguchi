'use client';

import { useActionState } from 'react';
import { saveGroup } from './actions';
import { initialFormState, type FormState } from '@/lib/admin/validate';
import { Field } from '@/components/admin/form/Field';
import { TextInput } from '@/components/admin/form/TextInput';
import { TextArea } from '@/components/admin/form/TextArea';
import { Checkbox } from '@/components/admin/form/Checkbox';
import { SubmitButton } from '@/components/admin/form/SubmitButton';
import { FormStatus } from '@/components/admin/form/FormStatus';
import { TranslationTabs } from '@/components/admin/form/TranslationTabs';
import type { GroupEdit } from '@/lib/admin/data/groups';

export function GroupForm({ initial, initialTab }: { initial?: GroupEdit; initialTab?: 'ja' | 'en' }) {
  const [state, action] = useActionState<FormState, FormData>(saveGroup, initialFormState);
  const base = initial?.base;

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-6">
      <FormStatus ok={state.ok} error={state.error} />
      {base && <input type="hidden" name="id" value={base.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="slug" required error={state.fieldErrors?.slug}>
          <TextInput name="slug" defaultValue={base?.slug ?? ''} required />
        </Field>
        <Field label="連絡先">
          <TextInput name="contact" defaultValue={base?.contact ?? ''} />
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

      <Field label="SNS URL" hint="1 行に 1 つ" error={state.fieldErrors?.sns_urls}>
        <TextArea name="sns_urls" defaultValue={(base?.sns_urls ?? []).join('\n')} />
      </Field>

      <Checkbox label="仮情報（※確認中）" name="is_provisional" defaultChecked={base?.is_provisional ?? false} />

      <TranslationTabs defaultTab={initialTab}>
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
                <TextArea name={`${loc}_description`} rows={6} defaultValue={t?.description ?? ''} />
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
