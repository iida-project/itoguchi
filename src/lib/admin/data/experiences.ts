import 'server-only';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { Tables } from '@/types/database.types';
import { pickTranslations } from './_shared';

export type ExperienceRow = Tables<'experiences'>;
export type ExperienceTranslationRow = Tables<'experience_translations'>;
export type ExperienceListItem = ExperienceRow & { translations: ExperienceTranslationRow[] };
export type ExperienceEdit = {
  base: ExperienceRow;
  ja: ExperienceTranslationRow | null;
  en: ExperienceTranslationRow | null;
};

export async function listExperiences(): Promise<ExperienceListItem[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('experiences')
    .select('*, translations:experience_translations(*)')
    .order('created_at', { ascending: true });
  if (error) throw new Error(`listExperiences failed: ${error.message}`);
  return (data ?? []) as unknown as ExperienceListItem[];
}

export async function getExperience(id: string): Promise<ExperienceEdit | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('experiences')
    .select('*, translations:experience_translations(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(`getExperience failed: ${error.message}`);
  if (!data) return null;

  const { translations, ...base } = data as unknown as ExperienceListItem;
  const { ja, en } = pickTranslations(translations);
  return { base: base as ExperienceRow, ja, en };
}
