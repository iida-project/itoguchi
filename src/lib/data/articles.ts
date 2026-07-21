import 'server-only';
import { cache } from 'react';
import type { Locale } from '@/i18n/routing';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  shapeArticleDetail,
  shapeArticleListItem,
  type ArticleRow,
} from './shape';
import type { ArticleDetail, ArticleListItem } from './types';

type ArticleFilters = {
  craftId?: string;
  // tag?: string — 現行スキーマに tags 列/テーブルが無いため未対応（メモ参照）
};

/**
 * 公開記事の一覧（公開日の新しい順）。
 * published_at の公開判定は RLS 側で担保される（未公開・未来日は返らない）。
 */
export const getArticles = cache(
  async (locale: Locale, filters: ArticleFilters = {}): Promise<ArticleListItem[]> => {
    const supabase = createServerSupabaseClient();
    let query = supabase
      .from('articles')
      .select('*, article_translations(*)')
      .order('published_at', { ascending: false });

    if (filters.craftId) query = query.eq('craft_id', filters.craftId);

    const { data, error } = await query;
    if (error) throw new Error(`getArticles failed: ${error.message}`);

    const rows = (data ?? []) as unknown as ArticleRow[];
    return rows.map((row) => shapeArticleListItem(row, locale));
  },
);

/** 記事詳細（本文 HTML 込み）。該当が無ければ null（呼び出し側で notFound()）。 */
export const getArticleBySlug = cache(
  async (slug: string, locale: Locale): Promise<ArticleDetail | null> => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('articles')
      .select('*, article_translations(*)')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw new Error(`getArticleBySlug failed: ${error.message}`);
    if (!data) return null;

    return shapeArticleDetail(data as unknown as ArticleRow, locale);
  },
);
