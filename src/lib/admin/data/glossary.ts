import 'server-only';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { Tables } from '@/types/database.types';

export type GlossaryRow = Tables<'glossary'>;

/** 用語集の全件（管理用・公開フィルタなし）。 */
export async function listGlossary(): Promise<GlossaryRow[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.from('glossary').select('*').order('ja', { ascending: true });
  if (error) throw new Error(`listGlossary failed: ${error.message}`);
  return data ?? [];
}

/** 用語 1 件。無ければ null。 */
export async function getGlossary(id: string): Promise<GlossaryRow | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase.from('glossary').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`getGlossary failed: ${error.message}`);
  return data ?? null;
}
