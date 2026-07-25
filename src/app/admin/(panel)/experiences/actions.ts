'use server';

import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/admin/auth';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { revalidatePublic } from '@/lib/admin/revalidate';
import {
  bool,
  oneOf,
  str,
  strOrNull,
  type FieldErrors,
  type FormState,
} from '@/lib/admin/validate';

const LOCALES = ['ja', 'en'] as const;
const AVAILABILITY = ['anytime', 'seasonal', 'request'] as const;

/** 体験の作成/更新（docs/12）。title・description が両方空の locale 行は削除する。 */
export async function saveExperience(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAuth();

  const id = str(fd, 'id');
  const craftId = str(fd, 'craft_id');
  const groupId = strOrNull(fd, 'group_id');
  const availability = str(fd, 'availability');

  const fieldErrors: FieldErrors = {};
  if (!craftId) fieldErrors.craft_id = '所属工芸は必須です。';
  if (!oneOf(availability, AVAILABILITY)) fieldErrors.availability = '受付形態が不正です。';
  if (!str(fd, 'ja_title')) fieldErrors.ja_title = '日本語のタイトルは必須です。';
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const supabase = createAdminSupabaseClient();
  const baseValues = {
    craft_id: craftId,
    group_id: groupId,
    availability,
    price_note: strOrNull(fd, 'price_note'),
    duration_note: strOrNull(fd, 'duration_note'),
    season_note: strOrNull(fd, 'season_note'),
    apply_method: strOrNull(fd, 'apply_method'),
    is_provisional: bool(fd, 'is_provisional'),
  };

  let experienceId = id;
  if (id) {
    const { error } = await supabase.from('experiences').update(baseValues).eq('id', id);
    if (error) return { error: `保存に失敗しました: ${error.message}` };
  } else {
    const { data, error } = await supabase.from('experiences').insert(baseValues).select('id').single();
    if (error) return { error: `保存に失敗しました: ${error.message}` };
    experienceId = data.id;
  }

  for (const loc of LOCALES) {
    const title = str(fd, `${loc}_title`);
    const description = strOrNull(fd, `${loc}_description`);
    if (title === '' && description === null) {
      const { error } = await supabase
        .from('experience_translations')
        .delete()
        .eq('experience_id', experienceId)
        .eq('locale', loc);
      if (error) return { error: `翻訳の削除に失敗しました: ${error.message}` };
      continue;
    }
    const { error } = await supabase.from('experience_translations').upsert(
      {
        experience_id: experienceId,
        locale: loc,
        title: title || null,
        description,
        is_published: bool(fd, `${loc}_is_published`),
        is_provisional: bool(fd, `${loc}_is_provisional`),
      },
      { onConflict: 'experience_id,locale' },
    );
    if (error) return { error: `翻訳の保存に失敗しました: ${error.message}` };
  }

  revalidatePublic();
  if (id) return { ok: true };
  redirect(`/admin/experiences/${experienceId}`);
}

export async function deleteExperience(id: string): Promise<void> {
  await requireAuth();
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from('experiences').delete().eq('id', id);
  if (error) throw new Error(`削除に失敗しました: ${error.message}`);
  revalidatePublic();
  redirect('/admin/experiences');
}
