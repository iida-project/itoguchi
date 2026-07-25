'use server';

import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/admin/auth';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { revalidatePublic } from '@/lib/admin/revalidate';
import { getExperience } from '@/lib/admin/data/experiences';
import { listGlossary } from '@/lib/admin/data/glossary';
import { translatePlainFields } from '@/lib/admin/translate/translate';
import { TranslationError } from '@/lib/admin/translate/gemini';
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

/** 英訳下訳を生成し en 下書きとして保存（docs/13）。 */
export async function generateExperienceEn(id: string, _prev: FormState, _fd: FormData): Promise<FormState> {
  await requireAuth();
  const experience = await getExperience(id);
  if (!experience) return { error: '体験が見つかりません。' };
  if (!experience.ja || !experience.ja.title) return { error: '先に日本語を保存してください。' };
  const ja = experience.ja;

  let translated: Record<string, string>;
  try {
    const glossary = await listGlossary();
    translated = await translatePlainFields(
      { title: ja.title ?? '', description: ja.description ?? '' },
      glossary,
    );
  } catch (e) {
    if (e instanceof TranslationError) return { error: e.message };
    return { error: `英訳生成に失敗しました: ${(e as Error).message}` };
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from('experience_translations').upsert(
    {
      experience_id: id,
      locale: 'en',
      title: translated.title || ja.title,
      description: translated.description ?? null,
      is_published: experience.en?.is_published ?? false,
      is_provisional: experience.en?.is_provisional ?? false,
    },
    { onConflict: 'experience_id,locale' },
  );
  if (error) return { error: `保存に失敗しました: ${error.message}` };

  revalidatePublic();
  redirect(`/admin/experiences/${id}?gen=${Date.now()}`);
}
