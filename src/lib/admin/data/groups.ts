import 'server-only';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { Tables } from '@/types/database.types';
import { pickTranslations } from './_shared';

export type GroupRow = Tables<'groups'>;
export type GroupTranslationRow = Tables<'group_translations'>;
export type GroupListItem = GroupRow & { translations: GroupTranslationRow[] };
export type GroupEdit = { base: GroupRow; ja: GroupTranslationRow | null; en: GroupTranslationRow | null };

/** 担い手の全件（翻訳同梱・公開フィルタなし）。 */
export async function listGroups(): Promise<GroupListItem[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('groups')
    .select('*, translations:group_translations(*)')
    .order('created_at', { ascending: true });
  if (error) throw new Error(`listGroups failed: ${error.message}`);
  return (data ?? []) as unknown as GroupListItem[];
}

/** 担い手 1 件（編集用・ja/en を分けて返す）。 */
export async function getGroup(id: string): Promise<GroupEdit | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('groups')
    .select('*, translations:group_translations(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(`getGroup failed: ${error.message}`);
  if (!data) return null;

  const { translations, ...base } = data as unknown as GroupListItem;
  const { ja, en } = pickTranslations(translations);
  return { base: base as GroupRow, ja, en };
}
