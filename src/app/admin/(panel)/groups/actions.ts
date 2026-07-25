'use server';

import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/admin/auth';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { revalidatePublic } from '@/lib/admin/revalidate';
import { getGroup } from '@/lib/admin/data/groups';
import { listGlossary } from '@/lib/admin/data/glossary';
import { translatePlainFields } from '@/lib/admin/translate/translate';
import { TranslationError } from '@/lib/admin/translate/gemini';
import {
  bool,
  isSlug,
  isUrl,
  linesToArray,
  numOrNull,
  str,
  strOrNull,
  type FieldErrors,
  type FormState,
} from '@/lib/admin/validate';

const LOCALES = ['ja', 'en'] as const;

/** 担い手の作成/更新（docs/12）。名称（NOT NULL）が空の locale 行は削除する。 */
export async function saveGroup(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAuth();

  const id = str(fd, 'id');
  const slug = str(fd, 'slug');
  const snsUrls = linesToArray(str(fd, 'sns_urls'));

  const fieldErrors: FieldErrors = {};
  if (!slug) fieldErrors.slug = 'slug は必須です。';
  else if (!isSlug(slug)) fieldErrors.slug = 'slug は英小文字・数字・ハイフンのみで指定してください。';
  if (!str(fd, 'ja_name')) fieldErrors.ja_name = '日本語の名称は必須です。';
  const badUrl = snsUrls.find((u) => !isUrl(u));
  if (badUrl) fieldErrors.sns_urls = `URL が不正です: ${badUrl}`;
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const supabase = createAdminSupabaseClient();
  const baseValues = {
    slug,
    address: strOrNull(fd, 'address'),
    lat: numOrNull(fd, 'lat'),
    lng: numOrNull(fd, 'lng'),
    contact: strOrNull(fd, 'contact'),
    sns_urls: snsUrls,
    is_provisional: bool(fd, 'is_provisional'),
  };

  let groupId = id;
  if (id) {
    const { error } = await supabase.from('groups').update(baseValues).eq('id', id);
    if (error) return baseError(error);
  } else {
    const { data, error } = await supabase.from('groups').insert(baseValues).select('id').single();
    if (error) return baseError(error);
    groupId = data.id;
  }

  for (const loc of LOCALES) {
    const name = str(fd, `${loc}_name`);
    if (name === '') {
      const { error } = await supabase
        .from('group_translations')
        .delete()
        .eq('group_id', groupId)
        .eq('locale', loc);
      if (error) return { error: `翻訳の削除に失敗しました: ${error.message}` };
      continue;
    }
    const { error } = await supabase.from('group_translations').upsert(
      {
        group_id: groupId,
        locale: loc,
        name,
        description: strOrNull(fd, `${loc}_description`),
        is_published: bool(fd, `${loc}_is_published`),
        is_provisional: bool(fd, `${loc}_is_provisional`),
      },
      { onConflict: 'group_id,locale' },
    );
    if (error) return { error: `翻訳の保存に失敗しました: ${error.message}` };
  }

  revalidatePublic();
  if (id) return { ok: true };
  redirect(`/admin/groups/${groupId}`);
}

export async function deleteGroup(id: string): Promise<void> {
  await requireAuth();
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from('groups').delete().eq('id', id);
  if (error) throw new Error(`削除に失敗しました: ${error.message}`);
  revalidatePublic();
  redirect('/admin/groups');
}

/** 英訳下訳を生成し en 下書きとして保存（docs/13）。 */
export async function generateGroupEn(id: string, _prev: FormState, _fd: FormData): Promise<FormState> {
  await requireAuth();
  const group = await getGroup(id);
  if (!group) return { error: '担い手が見つかりません。' };
  if (!group.ja) return { error: '先に日本語を保存してください。' };
  const ja = group.ja;

  let translated: Record<string, string>;
  try {
    const glossary = await listGlossary();
    translated = await translatePlainFields(
      { name: ja.name ?? '', description: ja.description ?? '' },
      glossary,
    );
  } catch (e) {
    if (e instanceof TranslationError) return { error: e.message };
    return { error: `英訳生成に失敗しました: ${(e as Error).message}` };
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from('group_translations').upsert(
    {
      group_id: id,
      locale: 'en',
      name: translated.name || ja.name,
      description: translated.description ?? null,
      is_published: group.en?.is_published ?? false,
      is_provisional: group.en?.is_provisional ?? false,
    },
    { onConflict: 'group_id,locale' },
  );
  if (error) return { error: `保存に失敗しました: ${error.message}` };

  revalidatePublic();
  redirect(`/admin/groups/${id}?gen=${Date.now()}`);
}

function baseError(error: { code?: string; message: string }): FormState {
  if (error.code === '23505') return { fieldErrors: { slug: 'この slug は既に使われています。' } };
  return { error: `保存に失敗しました: ${error.message}` };
}
