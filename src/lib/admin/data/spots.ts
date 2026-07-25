import 'server-only';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { Tables } from '@/types/database.types';
import { pickTranslations } from './_shared';

export type SpotRow = Tables<'spots'>;
export type SpotTranslationRow = Tables<'spot_translations'>;
export type SpotListItem = SpotRow & { translations: SpotTranslationRow[] };
export type SpotEdit = { base: SpotRow; ja: SpotTranslationRow | null; en: SpotTranslationRow | null };

export async function listSpots(): Promise<SpotListItem[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('spots')
    .select('*, translations:spot_translations(*)')
    .order('created_at', { ascending: true });
  if (error) throw new Error(`listSpots failed: ${error.message}`);
  return (data ?? []) as unknown as SpotListItem[];
}

export async function getSpot(id: string): Promise<SpotEdit | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('spots')
    .select('*, translations:spot_translations(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(`getSpot failed: ${error.message}`);
  if (!data) return null;

  const { translations, ...base } = data as unknown as SpotListItem;
  const { ja, en } = pickTranslations(translations);
  return { base: base as SpotRow, ja, en };
}
