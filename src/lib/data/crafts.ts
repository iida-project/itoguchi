import 'server-only';
import { cache } from 'react';
import type { Locale } from '@/i18n/routing';
import { todayISO } from '@/lib/date';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { resolveEnglishTranslation, resolveTranslation } from './translations';
import {
  collectGroups,
  shapeArticleListItem,
  shapeCraftListItem,
  shapeEvent,
  shapeExperience,
  shapeSpot,
  shapeStep,
  type CraftDetailRow,
  type CraftRow,
} from './shape';
import type { CraftDetail, CraftListItem } from './types';

// 工程・体験・イベント・スポット・記事・担い手を 1 クエリで一括取得（N+1 回避）
const CRAFT_DETAIL_SELECT = `
  *,
  craft_translations(*),
  craft_steps(*, craft_step_translations(*)),
  experiences(*, experience_translations(*), group:groups(*, group_translations(*))),
  events(*, event_translations(*), group:groups(*, group_translations(*))),
  spots(*, spot_translations(*)),
  articles(*, article_translations(*))
`;

/** 公開工芸の一覧（新しい順ではなく作成順で安定表示） */
export const getCrafts = cache(async (locale: Locale): Promise<CraftListItem[]> => {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('crafts')
    .select('*, craft_translations(*)')
    .eq('status', 'published')
    .order('created_at', { ascending: true });

  if (error) throw new Error(`getCrafts failed: ${error.message}`);
  const rows = (data ?? []) as unknown as CraftRow[];
  return rows.map((row) => shapeCraftListItem(row, locale));
});

/**
 * 工芸詳細（正本ページ）。該当が無ければ null を返す（呼び出し側で notFound()）。
 */
export const getCraftBySlug = cache(
  async (slug: string, locale: Locale): Promise<CraftDetail | null> => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('crafts')
      .select(CRAFT_DETAIL_SELECT)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (error) throw new Error(`getCraftBySlug failed: ${error.message}`);
    if (!data) return null;

    const row = data as unknown as CraftDetailRow;
    const today = todayISO();
    const base = shapeCraftListItem(row, locale);
    const { translation } = resolveTranslation(row.craft_translations, locale);
    // 章見出しの英字サブ（§3.3 層 2）。EN 未公開・EN ロケールでは null になる
    const english = resolveEnglishTranslation(row.craft_translations, locale);

    const steps = [...row.craft_steps]
      .sort((a, b) => a.position - b.position)
      .map((step) => shapeStep(step, locale));

    const experiences = row.experiences.map((exp) => shapeExperience(exp, locale));

    const upcomingEvents = row.events
      .map((event) => shapeEvent(event, locale, today))
      .filter((event) => !event.isEnded)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));

    const spots = row.spots.map((spot) => shapeSpot(spot, locale));

    const articles = [...row.articles]
      .sort((a, b) => (b.published_at ?? '').localeCompare(a.published_at ?? ''))
      .map((article) => shapeArticleListItem(article, locale));

    const groups = collectGroups([...row.experiences, ...row.events], locale);

    return {
      ...base,
      history: translation?.history ?? null,
      aboutHeading: translation?.about_heading ?? null,
      aboutHeadingEn: english?.about_heading ?? null,
      storyHeading: translation?.story_heading ?? null,
      storyHeadingEn: english?.story_heading ?? null,
      steps,
      groups,
      experiences,
      upcomingEvents,
      spots,
      articles,
    };
  },
);
