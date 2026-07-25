import 'server-only';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { Tables } from '@/types/database.types';
import { pickTranslations } from './_shared';

export type CraftRow = Tables<'crafts'>;
export type CraftTranslationRow = Tables<'craft_translations'>;
export type CraftStepRow = Tables<'craft_steps'>;
export type CraftStepTranslationRow = Tables<'craft_step_translations'>;

export type CraftListItem = CraftRow & { translations: CraftTranslationRow[] };
export type CraftStepEdit = {
  base: CraftStepRow;
  ja: CraftStepTranslationRow | null;
  en: CraftStepTranslationRow | null;
};
export type CraftEdit = {
  base: CraftRow;
  ja: CraftTranslationRow | null;
  en: CraftTranslationRow | null;
  steps: CraftStepEdit[];
};

export async function listCrafts(): Promise<CraftListItem[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('crafts')
    .select('*, translations:craft_translations(*)')
    .order('created_at', { ascending: true });
  if (error) throw new Error(`listCrafts failed: ${error.message}`);
  return (data ?? []) as unknown as CraftListItem[];
}

export type CraftStepListItem = CraftStepRow & { translations: CraftStepTranslationRow[] };

/**
 * 工程の横断一覧（`/admin/provisional` 用）。
 * 工程は工芸編集ページの中で編集するので専用の一覧ページは持たないが、
 * 仮情報のチェックだけは工芸をまたいで見たいのでここに置く。
 */
export async function listCraftSteps(): Promise<CraftStepListItem[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('craft_steps')
    .select('*, translations:craft_step_translations(*)')
    .order('craft_id', { ascending: true })
    .order('position', { ascending: true });
  if (error) throw new Error(`listCraftSteps failed: ${error.message}`);
  return (data ?? []) as unknown as CraftStepListItem[];
}

type CraftEditRow = CraftRow & {
  translations: CraftTranslationRow[];
  craft_steps: Array<CraftStepRow & { step_translations: CraftStepTranslationRow[] }>;
};

export async function getCraft(id: string): Promise<CraftEdit | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('crafts')
    .select(
      '*, translations:craft_translations(*), craft_steps(*, step_translations:craft_step_translations(*))',
    )
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(`getCraft failed: ${error.message}`);
  if (!data) return null;

  const { translations, craft_steps, ...base } = data as unknown as CraftEditRow;
  const { ja, en } = pickTranslations(translations);

  const steps: CraftStepEdit[] = [...(craft_steps ?? [])]
    .sort((a, b) => a.position - b.position)
    .map((s) => {
      const { step_translations, ...stepBase } = s;
      const picked = pickTranslations(step_translations);
      return { base: stepBase as CraftStepRow, ja: picked.ja, en: picked.en };
    });

  return { base: base as CraftRow, ja, en, steps };
}
