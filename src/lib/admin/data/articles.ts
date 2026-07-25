import 'server-only';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { Tables } from '@/types/database.types';
import { pickTranslations } from './_shared';

export type ArticleRow = Tables<'articles'>;
export type ArticleTranslationRow = Tables<'article_translations'>;
export type ArticleListItem = ArticleRow & { translations: ArticleTranslationRow[] };
export type ArticleEdit = {
  base: ArticleRow;
  ja: ArticleTranslationRow | null;
  en: ArticleTranslationRow | null;
};

export async function listArticles(): Promise<ArticleListItem[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('articles')
    .select('*, translations:article_translations(*)')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`listArticles failed: ${error.message}`);
  return (data ?? []) as unknown as ArticleListItem[];
}

export async function getArticle(id: string): Promise<ArticleEdit | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('articles')
    .select('*, translations:article_translations(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(`getArticle failed: ${error.message}`);
  if (!data) return null;

  const { translations, ...base } = data as unknown as ArticleListItem;
  const { ja, en } = pickTranslations(translations);
  return { base: base as ArticleRow, ja, en };
}
