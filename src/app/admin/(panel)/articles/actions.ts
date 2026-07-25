'use server';

import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/admin/auth';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { revalidatePublic } from '@/lib/admin/revalidate';
import { resolveImageField } from '@/lib/admin/image-field';
import { cleanupImageByUrl } from '@/lib/admin/storage';
import { sanitizeArticleHtml } from '@/lib/sanitize';
import {
  bool,
  isSlug,
  str,
  strOrNull,
  type FieldErrors,
  type FormState,
} from '@/lib/admin/validate';

const LOCALES = ['ja', 'en'] as const;

/** Tiptap の空エディタ（`<p></p>`）や空文字は本文なしとみなす。 */
function normalizeContent(raw: string): string | null {
  if (raw === '' || raw === '<p></p>') return null;
  return sanitizeArticleHtml(raw);
}

/** 記事の作成/更新（docs/12）。本文はサニタイズしてから保存する。 */
export async function saveArticle(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAuth();

  const id = str(fd, 'id');
  const slug = str(fd, 'slug');

  const fieldErrors: FieldErrors = {};
  if (!slug) fieldErrors.slug = 'slug は必須です。';
  else if (!isSlug(slug)) fieldErrors.slug = 'slug は英小文字・数字・ハイフンのみで指定してください。';
  if (!str(fd, 'ja_title')) fieldErrors.ja_title = '日本語のタイトルは必須です。';
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  let thumbnail: string | null;
  try {
    thumbnail = await resolveImageField(fd, 'thumbnail', 'articles');
  } catch (e) {
    return { error: `サムネイルのアップロードに失敗しました: ${(e as Error).message}` };
  }

  // 「公開する」チェック → published_at。既存の公開日時があれば維持する。
  const publishedAtCurrent = strOrNull(fd, 'published_at_current');
  const publishedAt = bool(fd, 'publish')
    ? (publishedAtCurrent ?? new Date().toISOString())
    : null;

  const supabase = createAdminSupabaseClient();
  const baseValues = {
    craft_id: strOrNull(fd, 'craft_id'),
    slug,
    thumbnail,
    published_at: publishedAt,
    is_provisional: bool(fd, 'is_provisional'),
  };

  let articleId = id;
  if (id) {
    const { error } = await supabase.from('articles').update(baseValues).eq('id', id);
    if (error) return baseError(error);
  } else {
    const { data, error } = await supabase.from('articles').insert(baseValues).select('id').single();
    if (error) return baseError(error);
    articleId = data.id;
  }

  for (const loc of LOCALES) {
    const title = str(fd, `${loc}_title`);
    if (title === '') {
      const { error } = await supabase
        .from('article_translations')
        .delete()
        .eq('article_id', articleId)
        .eq('locale', loc);
      if (error) return { error: `翻訳の削除に失敗しました: ${error.message}` };
      continue;
    }
    const { error } = await supabase.from('article_translations').upsert(
      {
        article_id: articleId,
        locale: loc,
        title,
        content: normalizeContent(str(fd, `${loc}_content`)),
        excerpt: strOrNull(fd, `${loc}_excerpt`),
        thumbnail_alt: strOrNull(fd, `${loc}_thumbnail_alt`),
        is_published: bool(fd, `${loc}_is_published`),
        is_provisional: bool(fd, `${loc}_is_provisional`),
      },
      { onConflict: 'article_id,locale' },
    );
    if (error) return { error: `翻訳の保存に失敗しました: ${error.message}` };
  }

  revalidatePublic();
  if (id) return { ok: true };
  redirect(`/admin/articles/${articleId}`);
}

export async function deleteArticle(id: string): Promise<void> {
  await requireAuth();
  const supabase = createAdminSupabaseClient();
  const { data: row } = await supabase.from('articles').select('thumbnail').eq('id', id).maybeSingle();
  const { error } = await supabase.from('articles').delete().eq('id', id);
  if (error) throw new Error(`削除に失敗しました: ${error.message}`);
  await cleanupImageByUrl(row?.thumbnail ?? null);
  revalidatePublic();
  redirect('/admin/articles');
}

function baseError(error: { code?: string; message: string }): FormState {
  if (error.code === '23505') return { fieldErrors: { slug: 'この slug は既に使われています。' } };
  return { error: `保存に失敗しました: ${error.message}` };
}
