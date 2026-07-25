'use server';

import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/admin/auth';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import { revalidatePublic } from '@/lib/admin/revalidate';
import { getEvent } from '@/lib/admin/data/events';
import { listGlossary } from '@/lib/admin/data/glossary';
import { translatePlainFields } from '@/lib/admin/translate/translate';
import { TranslationError } from '@/lib/admin/translate/gemini';
import {
  bool,
  isDate,
  isSlug,
  isUrl,
  numOrNull,
  oneOf,
  str,
  strOrNull,
  type FieldErrors,
  type FormState,
} from '@/lib/admin/validate';

const LOCALES = ['ja', 'en'] as const;
const STATUSES = ['draft', 'published', 'ended'] as const;

/** イベントの作成/更新（docs/12）。title（NOT NULL）が空の locale 行は削除する。 */
export async function saveEvent(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAuth();

  const id = str(fd, 'id');
  const slug = str(fd, 'slug');
  const status = str(fd, 'status');
  const startDate = str(fd, 'start_date');
  const endDate = strOrNull(fd, 'end_date');
  const applyUrl = strOrNull(fd, 'apply_url');

  const fieldErrors: FieldErrors = {};
  if (!slug) fieldErrors.slug = 'slug は必須です。';
  else if (!isSlug(slug)) fieldErrors.slug = 'slug は英小文字・数字・ハイフンのみで指定してください。';
  if (!oneOf(status, STATUSES)) fieldErrors.status = '公開状態が不正です。';
  if (!startDate || !isDate(startDate)) fieldErrors.start_date = '開始日を正しく指定してください。';
  if (endDate && !isDate(endDate)) fieldErrors.end_date = '終了日の形式が不正です。';
  if (applyUrl && !isUrl(applyUrl)) fieldErrors.apply_url = '申込 URL は http(s) で指定してください。';
  if (!str(fd, 'ja_title')) fieldErrors.ja_title = '日本語のタイトルは必須です。';
  if (Object.keys(fieldErrors).length) return { fieldErrors };

  const supabase = createAdminSupabaseClient();
  const baseValues = {
    craft_id: strOrNull(fd, 'craft_id'),
    group_id: strOrNull(fd, 'group_id'),
    slug,
    status,
    start_date: startDate,
    end_date: endDate,
    time_note: strOrNull(fd, 'time_note'),
    venue: strOrNull(fd, 'venue'),
    address: strOrNull(fd, 'address'),
    lat: numOrNull(fd, 'lat'),
    lng: numOrNull(fd, 'lng'),
    fee_note: strOrNull(fd, 'fee_note'),
    capacity_note: strOrNull(fd, 'capacity_note'),
    apply_url: applyUrl,
    apply_note: strOrNull(fd, 'apply_note'),
    is_provisional: bool(fd, 'is_provisional'),
  };

  let eventId = id;
  if (id) {
    const { error } = await supabase.from('events').update(baseValues).eq('id', id);
    if (error) return baseError(error);
  } else {
    const { data, error } = await supabase.from('events').insert(baseValues).select('id').single();
    if (error) return baseError(error);
    eventId = data.id;
  }

  for (const loc of LOCALES) {
    const title = str(fd, `${loc}_title`);
    if (title === '') {
      const { error } = await supabase
        .from('event_translations')
        .delete()
        .eq('event_id', eventId)
        .eq('locale', loc);
      if (error) return { error: `翻訳の削除に失敗しました: ${error.message}` };
      continue;
    }
    const { error } = await supabase.from('event_translations').upsert(
      {
        event_id: eventId,
        locale: loc,
        title,
        description: strOrNull(fd, `${loc}_description`),
        is_published: bool(fd, `${loc}_is_published`),
        is_provisional: bool(fd, `${loc}_is_provisional`),
      },
      { onConflict: 'event_id,locale' },
    );
    if (error) return { error: `翻訳の保存に失敗しました: ${error.message}` };
  }

  revalidatePublic();
  if (id) return { ok: true };
  redirect(`/admin/events/${eventId}`);
}

export async function deleteEvent(id: string): Promise<void> {
  await requireAuth();
  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw new Error(`削除に失敗しました: ${error.message}`);
  revalidatePublic();
  redirect('/admin/events');
}

/** 英訳下訳を生成し en 下書きとして保存（docs/13）。 */
export async function generateEventEn(id: string, _prev: FormState, _fd: FormData): Promise<FormState> {
  await requireAuth();
  const event = await getEvent(id);
  if (!event) return { error: 'イベントが見つかりません。' };
  if (!event.ja) return { error: '先に日本語を保存してください。' };
  const ja = event.ja;

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
  const { error } = await supabase.from('event_translations').upsert(
    {
      event_id: id,
      locale: 'en',
      title: translated.title || ja.title,
      description: translated.description ?? null,
      is_published: event.en?.is_published ?? false,
      is_provisional: event.en?.is_provisional ?? false,
    },
    { onConflict: 'event_id,locale' },
  );
  if (error) return { error: `保存に失敗しました: ${error.message}` };

  revalidatePublic();
  redirect(`/admin/events/${id}?gen=${Date.now()}`);
}

function baseError(error: { code?: string; message: string }): FormState {
  if (error.code === '23505') return { fieldErrors: { slug: 'この slug は既に使われています。' } };
  return { error: `保存に失敗しました: ${error.message}` };
}
