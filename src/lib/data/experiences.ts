import 'server-only';
import { cache } from 'react';
import type { Locale } from '@/i18n/routing';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  shapeCraftRef,
  shapeExperience,
  type CraftRefRow,
  type ExperienceRow,
} from './shape';
import type { Availability, ExperienceListItem } from './types';

type ExperienceFilters = {
  craftId?: string;
  region?: string;
  availability?: Availability;
};

type ExperienceListRow = ExperienceRow & {
  craft: CraftRefRow | null;
};

/**
 * 体験（随時受付）の一覧。工芸・受付形態で絞り込み可能。
 * region は埋め込み craft の値で JS 側フィルタ（埋め込み列の SQL 絞り込みは避ける）。
 */
export const getExperiences = cache(
  async (
    locale: Locale,
    filters: ExperienceFilters = {},
  ): Promise<ExperienceListItem[]> => {
    const supabase = createServerSupabaseClient();
    let query = supabase
      .from('experiences')
      .select(
        '*, experience_translations(*), group:groups(*, group_translations(*)), craft:crafts(slug, region, craft_translations(*))',
      )
      .order('created_at', { ascending: true });

    if (filters.craftId) query = query.eq('craft_id', filters.craftId);
    if (filters.availability) query = query.eq('availability', filters.availability);

    const { data, error } = await query;
    if (error) throw new Error(`getExperiences failed: ${error.message}`);

    let rows = (data ?? []) as unknown as ExperienceListRow[];
    if (filters.region) {
      rows = rows.filter((row) => row.craft?.region === filters.region);
    }

    return rows.map((row) => ({
      ...shapeExperience(row, locale),
      craft: shapeCraftRef(row.craft, locale),
    }));
  },
);
