import 'server-only';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

/** Select 用の選択肢（工芸・担い手の関連付け）。 */
export type Option = { id: string; label: string };

type OptionQueryRow = {
  id: string;
  slug: string;
  translations: { locale: string; name: string }[];
};

function toOptions(rows: OptionQueryRow[]): Option[] {
  return rows.map((r) => {
    const jaName = r.translations.find((t) => t.locale === 'ja')?.name;
    return { id: r.id, label: jaName ?? r.slug };
  });
}

/** 工芸の選択肢（日本語名 or slug）。 */
export async function listCraftOptions(): Promise<Option[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('crafts')
    .select('id, slug, translations:craft_translations(locale, name)')
    .order('created_at', { ascending: true });
  if (error) throw new Error(`listCraftOptions failed: ${error.message}`);
  return toOptions((data ?? []) as unknown as OptionQueryRow[]);
}

/** 担い手の選択肢（日本語名 or slug）。 */
export async function listGroupOptions(): Promise<Option[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('groups')
    .select('id, slug, translations:group_translations(locale, name)')
    .order('created_at', { ascending: true });
  if (error) throw new Error(`listGroupOptions failed: ${error.message}`);
  return toOptions((data ?? []) as unknown as OptionQueryRow[]);
}
