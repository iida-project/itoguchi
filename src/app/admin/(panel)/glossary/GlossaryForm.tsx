'use client';

import { useActionState } from 'react';
import { saveGlossary } from './actions';
import { initialFormState, type FormState } from '@/lib/admin/validate';
import { Field } from '@/components/admin/form/Field';
import { TextInput } from '@/components/admin/form/TextInput';
import { TextArea } from '@/components/admin/form/TextArea';
import { SubmitButton } from '@/components/admin/form/SubmitButton';
import { FormStatus } from '@/components/admin/form/FormStatus';
import type { GlossaryRow } from '@/lib/admin/data/glossary';

export function GlossaryForm({ initial }: { initial?: GlossaryRow }) {
  const [state, action] = useActionState<FormState, FormData>(saveGlossary, initialFormState);

  return (
    <form action={action} className="flex max-w-reading flex-col gap-5">
      <FormStatus ok={state.ok} error={state.error} />
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <Field label="用語（日本語）" required error={state.fieldErrors?.ja}>
        <TextInput name="ja" defaultValue={initial?.ja ?? ''} required />
      </Field>

      <Field label="英訳">
        <TextInput name="en" defaultValue={initial?.en ?? ''} />
      </Field>

      <Field label="メモ" hint="対訳の補足・注記（任意）">
        <TextArea name="note" defaultValue={initial?.note ?? ''} />
      </Field>

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
