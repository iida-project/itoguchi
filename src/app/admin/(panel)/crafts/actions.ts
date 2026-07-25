'use server';

import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/admin/auth';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { revalidatePublic } from '@/lib/admin/revalidate';
import { resolveImageField } from '@/lib/admin/image-field';
import { cleanupImageByUrl } from '@/lib/admin/storage';
import { getCraft, type CraftStepTranslationRow } from '@/lib/admin/data/crafts';
import { listGlossary } from '@/lib/admin/data/glossary';
import { translatePlainFields } from '@/lib/admin/translate/translate';
import { TranslationError } from '@/lib/admin/translate/gemini';
import {
  bool,
  isSlug,
  oneOf,
  str,
  strOrNull,
  type FieldErrors,
  type FormState,
} from '@/lib/admin/validate';

const LOCALES = ['ja', 'en'] as const;
const STATUSES = ['draft', 'published'] as const;

// ---- 工芸本体 ----

/** 工芸の作成/更新（docs/12）。name（NOT NULL）が空の locale 行は削除する。 */
export async function saveCraft(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAuth();

  const id = str(fd, 'id');
  const slug = str(fd, 'slug');
  const status = str(fd, 'status');

  const fieldErrors: FieldErrors = {};
  if (!slug) fieldErrors.slug = 'slug は必須です。';
  else if (!isSlug(slug)) fieldErrors.slug = 'slug は英小文字・数字・ハイフンのみで指定してください。';
  if (!oneOf(status, STATUSES)) fieldErrors.status = '公開状態が不正です。';
  if (!str(fd, 'ja_name')) fieldErrors.ja_name = '日本語の名称は必須です。';
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  let heroImageUrl: string | null;
  try {
    heroImageUrl = await resolveImageField(fd, 'hero_image', 'crafts');
  } catch (e) {
    return { error: `ヒーロー画像のアップロードに失敗しました: ${(e as Error).message}` };
  }

  const supabase = createAdminSupabaseClient();
  const baseValues = {
    slug,
    status,
    hero_image_url: heroImageUrl,
    region: strOrNull(fd, 'region'),
    name_latin: strOrNull(fd, 'name_latin'),
    admin_note: strOrNull(fd, 'admin_note'),
    is_provisional: bool(fd, 'is_provisional'),
  };

  let craftId = id;
  if (id) {
    const { error } = await supabase.from('crafts').update(baseValues).eq('id', id);
    if (error) return baseError(error);
  } else {
    const { data, error } = await supabase.from('crafts').insert(baseValues).select('id').single();
    if (error) return baseError(error);
    craftId = data.id;
  }

  for (const loc of LOCALES) {
    const name = str(fd, `${loc}_name`);
    if (name === '') {
      const { error } = await supabase
        .from('craft_translations')
        .delete()
        .eq('craft_id', craftId)
        .eq('locale', loc);
      if (error) return { error: `翻訳の削除に失敗しました: ${error.message}` };
      continue;
    }
    const { error } = await supabase.from('craft_translations').upsert(
      {
        craft_id: craftId,
        locale: loc,
        name,
        tagline: strOrNull(fd, `${loc}_tagline`),
        overview: strOrNull(fd, `${loc}_overview`),
        history: strOrNull(fd, `${loc}_history`),
        hero_image_alt: strOrNull(fd, `${loc}_hero_image_alt`),
        about_heading: strOrNull(fd, `${loc}_about_heading`),
        story_heading: strOrNull(fd, `${loc}_story_heading`),
        is_published: bool(fd, `${loc}_is_published`),
        is_provisional: bool(fd, `${loc}_is_provisional`),
      },
      { onConflict: 'craft_id,locale' },
    );
    if (error) return { error: `翻訳の保存に失敗しました: ${error.message}` };
  }

  revalidatePublic();
  if (id) return { ok: true };
  redirect(`/admin/crafts/${craftId}`);
}

export async function deleteCraft(id: string): Promise<void> {
  await requireAuth();
  const supabase = createAdminSupabaseClient();
  const { data: row } = await supabase.from('crafts').select('hero_image_url').eq('id', id).maybeSingle();
  const { error } = await supabase.from('crafts').delete().eq('id', id);
  if (error) throw new Error(`削除に失敗しました: ${error.message}`);
  await cleanupImageByUrl(row?.hero_image_url ?? null);
  revalidatePublic();
  redirect('/admin/crafts');
}

/** 英訳下訳を生成し en 下書きとして保存（docs/13）。成功で `?gen=` へ redirect。 */
export async function generateCraftEn(id: string, _prev: FormState, _fd: FormData): Promise<FormState> {
  await requireAuth();
  const craft = await getCraft(id);
  if (!craft) return { error: '工芸が見つかりません。' };
  if (!craft.ja) return { error: '先に日本語を保存してください。' };
  const ja = craft.ja;

  let translated: Record<string, string>;
  try {
    const glossary = await listGlossary();
    translated = await translatePlainFields(
      {
        name: ja.name ?? '',
        tagline: ja.tagline ?? '',
        overview: ja.overview ?? '',
        history: ja.history ?? '',
        about_heading: ja.about_heading ?? '',
        story_heading: ja.story_heading ?? '',
        hero_image_alt: ja.hero_image_alt ?? '',
      },
      glossary,
    );
  } catch (e) {
    if (e instanceof TranslationError) return { error: e.message };
    return { error: `英訳生成に失敗しました: ${(e as Error).message}` };
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from('craft_translations').upsert(
    {
      craft_id: id,
      locale: 'en',
      name: translated.name || ja.name,
      tagline: translated.tagline ?? null,
      overview: translated.overview ?? null,
      history: translated.history ?? null,
      about_heading: translated.about_heading ?? null,
      story_heading: translated.story_heading ?? null,
      hero_image_alt: translated.hero_image_alt ?? null,
      is_published: craft.en?.is_published ?? false,
      is_provisional: craft.en?.is_provisional ?? false,
    },
    { onConflict: 'craft_id,locale' },
  );
  if (error) return { error: `保存に失敗しました: ${error.message}` };

  revalidatePublic();
  redirect(`/admin/crafts/${id}?gen=${Date.now()}`);
}

// ---- 工程（craft_steps）: 1 行ずつのアクション ----

/** 工程を末尾に追加する（空の 1 行。中身は追加後に編集）。 */
export async function addStep(craftId: string): Promise<void> {
  await requireAuth();
  const supabase = createAdminSupabaseClient();
  const { data: rows } = await supabase
    .from('craft_steps')
    .select('position')
    .eq('craft_id', craftId)
    .order('position', { ascending: false })
    .limit(1);
  const nextPosition = (rows?.[0]?.position ?? 0) + 1;
  const { error } = await supabase
    .from('craft_steps')
    .insert({ craft_id: craftId, position: nextPosition, is_provisional: false });
  if (error) throw new Error(`工程の追加に失敗しました: ${error.message}`);
  revalidatePublic();
}

/** 工程の更新（画像 + ja/en）。title/description/image_alt が全て空の locale 行は削除。 */
export async function updateStep(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAuth();
  const stepId = str(fd, 'step_id');
  if (!stepId) return { error: '工程 ID がありません。' };

  let imageUrl: string | null;
  try {
    imageUrl = await resolveImageField(fd, 'image', 'craft-steps');
  } catch (e) {
    return { error: `画像のアップロードに失敗しました: ${(e as Error).message}` };
  }

  const supabase = createAdminSupabaseClient();
  const { error: baseErr } = await supabase
    .from('craft_steps')
    .update({ image_url: imageUrl, is_provisional: bool(fd, 'is_provisional') })
    .eq('id', stepId);
  if (baseErr) return { error: `保存に失敗しました: ${baseErr.message}` };

  for (const loc of LOCALES) {
    const title = str(fd, `${loc}_title`);
    const description = strOrNull(fd, `${loc}_description`);
    const imageAlt = strOrNull(fd, `${loc}_image_alt`);
    if (title === '' && description === null && imageAlt === null) {
      const { error } = await supabase
        .from('craft_step_translations')
        .delete()
        .eq('craft_step_id', stepId)
        .eq('locale', loc);
      if (error) return { error: `翻訳の削除に失敗しました: ${error.message}` };
      continue;
    }
    const { error } = await supabase.from('craft_step_translations').upsert(
      {
        craft_step_id: stepId,
        locale: loc,
        title: title || null,
        description,
        image_alt: imageAlt,
        is_published: bool(fd, `${loc}_is_published`),
        is_provisional: bool(fd, `${loc}_is_provisional`),
      },
      { onConflict: 'craft_step_id,locale' },
    );
    if (error) return { error: `翻訳の保存に失敗しました: ${error.message}` };
  }

  revalidatePublic();
  return { ok: true };
}

/** 工程を削除する（画像は best-effort で掃除）。 */
export async function deleteStep(stepId: string): Promise<void> {
  await requireAuth();
  const supabase = createAdminSupabaseClient();
  const { data: row } = await supabase
    .from('craft_steps')
    .select('image_url')
    .eq('id', stepId)
    .maybeSingle();
  const { error } = await supabase.from('craft_steps').delete().eq('id', stepId);
  if (error) throw new Error(`工程の削除に失敗しました: ${error.message}`);
  await cleanupImageByUrl(row?.image_url ?? null);
  revalidatePublic();
}

/** 工程の並び替え（隣と position を入れ替える。index は非 unique なので途中衝突なし）。 */
export async function moveStep(stepId: string, direction: 'up' | 'down'): Promise<void> {
  await requireAuth();
  const supabase = createAdminSupabaseClient();

  const { data: step } = await supabase
    .from('craft_steps')
    .select('id, craft_id, position')
    .eq('id', stepId)
    .maybeSingle();
  if (!step) return;

  const { data: steps } = await supabase
    .from('craft_steps')
    .select('id, position')
    .eq('craft_id', step.craft_id)
    .order('position', { ascending: true });
  if (!steps) return;

  const idx = steps.findIndex((s) => s.id === stepId);
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= steps.length) return;

  const other = steps[swapIdx];
  await supabase.from('craft_steps').update({ position: other.position }).eq('id', step.id);
  await supabase.from('craft_steps').update({ position: step.position }).eq('id', other.id);
  revalidatePublic();
}

/** 工程の英訳下訳を生成し en 下書きとして保存（docs/13）。成功で craft 編集へ `?gen=` redirect。 */
export async function generateStepEn(stepId: string, _prev: FormState, _fd: FormData): Promise<FormState> {
  await requireAuth();
  const supabase = createAdminSupabaseClient();

  const { data, error: readErr } = await supabase
    .from('craft_steps')
    .select('id, craft_id, step_translations:craft_step_translations(*)')
    .eq('id', stepId)
    .maybeSingle();
  if (readErr) return { error: `読み込みに失敗しました: ${readErr.message}` };
  if (!data) return { error: '工程が見つかりません。' };

  const step = data as unknown as {
    id: string;
    craft_id: string;
    step_translations: CraftStepTranslationRow[];
  };
  const ja = step.step_translations.find((t) => t.locale === 'ja') ?? null;
  const en = step.step_translations.find((t) => t.locale === 'en') ?? null;
  if (!ja || (!ja.title && !ja.description && !ja.image_alt)) {
    return { error: '先に日本語を保存してください。' };
  }

  let translated: Record<string, string>;
  try {
    const glossary = await listGlossary();
    translated = await translatePlainFields(
      { title: ja.title ?? '', description: ja.description ?? '', image_alt: ja.image_alt ?? '' },
      glossary,
    );
  } catch (e) {
    if (e instanceof TranslationError) return { error: e.message };
    return { error: `英訳生成に失敗しました: ${(e as Error).message}` };
  }

  const { error } = await supabase.from('craft_step_translations').upsert(
    {
      craft_step_id: stepId,
      locale: 'en',
      title: translated.title ?? null,
      description: translated.description ?? null,
      image_alt: translated.image_alt ?? null,
      is_published: en?.is_published ?? false,
      is_provisional: en?.is_provisional ?? false,
    },
    { onConflict: 'craft_step_id,locale' },
  );
  if (error) return { error: `保存に失敗しました: ${error.message}` };

  revalidatePublic();
  redirect(`/admin/crafts/${step.craft_id}?gen=${Date.now()}`);
}

function baseError(error: { code?: string; message: string }): FormState {
  if (error.code === '23505') return { fieldErrors: { slug: 'この slug は既に使われています。' } };
  return { error: `保存に失敗しました: ${error.message}` };
}
