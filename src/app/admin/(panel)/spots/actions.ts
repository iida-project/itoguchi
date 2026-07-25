'use server';

import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/admin/auth';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { revalidatePublic } from '@/lib/admin/revalidate';
import { getSpot } from '@/lib/admin/data/spots';
import { listGlossary } from '@/lib/admin/data/glossary';
import { translatePlainFields } from '@/lib/admin/translate/translate';
import { TranslationError } from '@/lib/admin/translate/gemini';
import {
  bool,
  isUrl,
  numOrNull,
  oneOf,
  str,
  strOrNull,
  type FieldErrors,
  type FormState,
} from '@/lib/admin/validate';

const LOCALES = ['ja', 'en'] as const;
const TYPES = ['shop', 'museum', 'other'] as const;

/** スポットの作成/更新（docs/12）。名称・紹介が両方空の locale 行は削除する。 */
export async function saveSpot(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAuth();

  const id = str(fd, 'id');
  const craftId = str(fd, 'craft_id');
  const type = str(fd, 'type');
  const url = strOrNull(fd, 'url');

  const fieldErrors: FieldErrors = {};
  if (!craftId) fieldErrors.craft_id = '所属工芸は必須です。';
  if (!oneOf(type, TYPES)) fieldErrors.type = '種別が不正です。';
  if (url && !isUrl(url)) fieldErrors.url = 'URL は http(s) で指定してください。';
  if (!str(fd, 'ja_name')) fieldErrors.ja_name = '日本語の名称は必須です。';
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const supabase = createAdminSupabaseClient();
  const baseValues = {
    craft_id: craftId,
    type,
    address: strOrNull(fd, 'address'),
    lat: numOrNull(fd, 'lat'),
    lng: numOrNull(fd, 'lng'),
    url,
    is_provisional: bool(fd, 'is_provisional'),
  };

  let spotId = id;
  if (id) {
    const { error } = await supabase.from('spots').update(baseValues).eq('id', id);
    if (error) return { error: `保存に失敗しました: ${error.message}` };
  } else {
    const { data, error } = await supabase.from('spots').insert(baseValues).select('id').single();
    if (error) return { error: `保存に失敗しました: ${error.message}` };
    spotId = data.id;
  }

  for (const loc of LOCALES) {
    const name = str(fd, `${loc}_name`);
    const description = strOrNull(fd, `${loc}_description`);
    if (name === '' && description === null) {
      const { error } = await supabase
        .from('spot_translations')
        .delete()
        .eq('spot_id', spotId)
        .eq('locale', loc);
      if (error) return { error: `翻訳の削除に失敗しました: ${error.message}` };
      continue;
    }
    const { error } = await supabase.from('spot_translations').upsert(
      {
        spot_id: spotId,
        locale: loc,
        name: name || null,
        description,
        is_published: bool(fd, `${loc}_is_published`),
        is_provisional: bool(fd, `${loc}_is_provisional`),
      },
      { onConflict: 'spot_id,locale' },
    );
    if (error) return { error: `翻訳の保存に失敗しました: ${error.message}` };
  }

  revalidatePublic();
  if (id) return { ok: true };
  redirect(`/admin/spots/${spotId}`);
}

export async function deleteSpot(id: string): Promise<void> {
  await requireAuth();
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from('spots').delete().eq('id', id);
  if (error) throw new Error(`削除に失敗しました: ${error.message}`);
  revalidatePublic();
  redirect('/admin/spots');
}

/** 英訳下訳を生成し en 下書きとして保存（docs/13）。 */
export async function generateSpotEn(id: string, _prev: FormState, _fd: FormData): Promise<FormState> {
  await requireAuth();
  const spot = await getSpot(id);
  if (!spot) return { error: 'スポットが見つかりません。' };
  if (!spot.ja || !spot.ja.name) return { error: '先に日本語を保存してください。' };
  const ja = spot.ja;

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
  const { error } = await supabase.from('spot_translations').upsert(
    {
      spot_id: id,
      locale: 'en',
      name: translated.name || ja.name,
      description: translated.description ?? null,
      is_published: spot.en?.is_published ?? false,
      is_provisional: spot.en?.is_provisional ?? false,
    },
    { onConflict: 'spot_id,locale' },
  );
  if (error) return { error: `保存に失敗しました: ${error.message}` };

  revalidatePublic();
  redirect(`/admin/spots/${id}?gen=${Date.now()}`);
}
