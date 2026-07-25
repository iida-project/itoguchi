'use client';

import { useActionState } from 'react';
import { saveCraft } from './actions';
import { initialFormState, type FormState } from '@/lib/admin/validate';
import { Field } from '@/components/admin/form/Field';
import { TextInput } from '@/components/admin/form/TextInput';
import { TextArea } from '@/components/admin/form/TextArea';
import { Select } from '@/components/admin/form/Select';
import { Checkbox } from '@/components/admin/form/Checkbox';
import { SubmitButton } from '@/components/admin/form/SubmitButton';
import { FormStatus } from '@/components/admin/form/FormStatus';
import { TranslationTabs } from '@/components/admin/form/TranslationTabs';
import { ImageField } from '@/components/admin/form/ImageField';
import type { CraftEdit } from '@/lib/admin/data/crafts';

export function CraftForm({ initial }: { initial?: CraftEdit }) {
  const [state, action] = useActionState<FormState, FormData>(saveCraft, initialFormState);
  const base = initial?.base;

  return (
    <form action={action} className="flex max-w-3xl flex-col gap-6">
      <FormStatus ok={state.ok} error={state.error} />
      {base && <input type="hidden" name="id" value={base.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="slug" required error={state.fieldErrors?.slug}>
          <TextInput name="slug" defaultValue={base?.slug ?? ''} required />
        </Field>
        <Field label="公開状態" required error={state.fieldErrors?.status}>
          <Select name="status" defaultValue={base?.status ?? 'draft'}>
            <option value="draft">下書き</option>
            <option value="published">公開</option>
          </Select>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="地域">
          <TextInput name="region" defaultValue={base?.region ?? ''} />
        </Field>
        <Field label="工芸名（英字）" hint="例: Tōyama Fuji-ito — wisteria-vine thread">
          <TextInput name="name_latin" defaultValue={base?.name_latin ?? ''} />
        </Field>
      </div>

      <ImageField name="hero_image" label="ヒーロー画像" currentUrl={base?.hero_image_url} />

      <Field label="管理メモ" hint="掲載許可の記録（誰から・いつ・範囲）。公開ページには表示されません">
        <TextArea name="admin_note" rows={3} defaultValue={base?.admin_note ?? ''} />
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
              <Field label="ひとこと（tagline）">
                <TextInput name={`${loc}_tagline`} defaultValue={t?.tagline ?? ''} />
              </Field>
              <Field label="概要（overview）">
                <TextArea name={`${loc}_overview`} rows={5} defaultValue={t?.overview ?? ''} />
              </Field>
              <Field label="歴史・物語（history）" hint="段落は空行で区切ります">
                <TextArea name={`${loc}_history`} rows={8} defaultValue={t?.history ?? ''} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="概要の見出し（about_heading）">
                  <TextInput name={`${loc}_about_heading`} defaultValue={t?.about_heading ?? ''} />
                </Field>
                <Field label="物語の見出し（story_heading）">
                  <TextInput name={`${loc}_story_heading`} defaultValue={t?.story_heading ?? ''} />
                </Field>
              </div>
              <Field label="ヒーロー画像の代替テキスト">
                <TextInput name={`${loc}_hero_image_alt`} defaultValue={t?.hero_image_alt ?? ''} />
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
