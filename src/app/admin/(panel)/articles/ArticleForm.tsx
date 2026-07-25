'use client';

import { useActionState } from 'react';
import { saveArticle } from './actions';
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
import { RichTextField } from '@/components/admin/form/RichTextField';
import type { ArticleEdit } from '@/lib/admin/data/articles';
import type { Option } from '@/lib/admin/data/options';

export function ArticleForm({ initial, craftOptions }: { initial?: ArticleEdit; craftOptions: Option[] }) {
  const [state, action] = useActionState<FormState, FormData>(saveArticle, initialFormState);
  const base = initial?.base;

  return (
    <form action={action} className="flex max-w-3xl flex-col gap-6">
      <FormStatus ok={state.ok} error={state.error} />
      {base && <input type="hidden" name="id" value={base.id} />}
      <input type="hidden" name="published_at_current" value={base?.published_at ?? ''} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="slug" required error={state.fieldErrors?.slug}>
          <TextInput name="slug" defaultValue={base?.slug ?? ''} required />
        </Field>
        <Field label="関連工芸（任意）">
          <Select name="craft_id" defaultValue={base?.craft_id ?? ''}>
            <option value="">（なし）</option>
            {craftOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <ImageField name="thumbnail" label="サムネイル画像" currentUrl={base?.thumbnail} />

      <div className="flex flex-wrap gap-6">
        <Checkbox
          label="公開する（記事一覧・詳細に掲載）"
          name="publish"
          defaultChecked={Boolean(base?.published_at)}
        />
        <Checkbox label="仮情報（※確認中）" name="is_provisional" defaultChecked={base?.is_provisional ?? false} />
      </div>

      <TranslationTabs>
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
              <Field label="抜粋">
                <TextArea name={`${loc}_excerpt`} rows={3} defaultValue={t?.excerpt ?? ''} />
              </Field>
              <Field label="サムネイル代替テキスト">
                <TextInput name={`${loc}_thumbnail_alt`} defaultValue={t?.thumbnail_alt ?? ''} />
              </Field>
              <Field label="本文" hint="見出しは h2 から。保存時にサニタイズされます">
                <RichTextField name={`${loc}_content`} initialHtml={t?.content ?? ''} />
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
