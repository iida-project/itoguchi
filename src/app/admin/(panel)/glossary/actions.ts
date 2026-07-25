'use server';

import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/admin/auth';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { str, strOrNull, type FieldErrors, type FormState } from '@/lib/admin/validate';

/** 用語集の作成/更新（docs/12）。flat な ja/en/note のみ。 */
export async function saveGlossary(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAuth();

  const id = str(fd, 'id');
  const ja = str(fd, 'ja');
  const en = strOrNull(fd, 'en');
  const note = strOrNull(fd, 'note');

  const fieldErrors: FieldErrors = {};
  if (!ja) fieldErrors.ja = '用語（日本語）は必須です。';
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const supabase = createAdminSupabaseClient();

  if (id) {
    const { error } = await supabase.from('glossary').update({ ja, en, note }).eq('id', id);
    if (error) {
      if (error.code === '23505') return { fieldErrors: { ja: 'この用語は既に登録されています。' } };
      return { error: `保存に失敗しました: ${error.message}` };
    }
    return { ok: true };
  }

  const { data, error } = await supabase
    .from('glossary')
    .insert({ ja, en, note })
    .select('id')
    .single();
  if (error) {
    if (error.code === '23505') return { fieldErrors: { ja: 'この用語は既に登録されています。' } };
    return { error: `保存に失敗しました: ${error.message}` };
  }
  redirect(`/admin/glossary/${data.id}`);
}

/** 用語集の削除。 */
export async function deleteGlossary(id: string): Promise<void> {
  await requireAuth();
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from('glossary').delete().eq('id', id);
  if (error) throw new Error(`削除に失敗しました: ${error.message}`);
  redirect('/admin/glossary');
}
