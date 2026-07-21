import 'server-only';
import { cache } from 'react';
import type { Locale } from '@/i18n/routing';
import { todayISO } from '@/lib/date';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  shapeCraftRef,
  shapeEvent,
  shapeGroup,
  type CraftRefRow,
  type EventRow,
  type GroupRow,
} from './shape';
import type { EventDetail, EventListItem } from './types';

type EventFilters = {
  /** 'YYYY-MM' 指定でその月に開始するイベントに絞る */
  month?: string;
  craftId?: string;
};

/** 指定月の初日・末日を 'YYYY-MM-DD' で返す */
function monthRange(month: string): { start: string; end: string } {
  const [year, mon] = month.split('-').map(Number);
  const lastDay = new Date(year, mon, 0).getDate();
  return {
    start: `${month}-01`,
    end: `${month}-${String(lastDay).padStart(2, '0')}`,
  };
}

/**
 * 公開イベント一覧（開催日昇順）。ended（過去）もアーカイブとして含み、各行に isEnded を付与する。
 */
export const getEvents = cache(
  async (locale: Locale, filters: EventFilters = {}): Promise<EventListItem[]> => {
    const supabase = createServerSupabaseClient();
    let query = supabase
      .from('events')
      .select('*, event_translations(*)')
      .in('status', ['published', 'ended'])
      .order('start_date', { ascending: true });

    if (filters.craftId) query = query.eq('craft_id', filters.craftId);
    if (filters.month) {
      const { start, end } = monthRange(filters.month);
      query = query.gte('start_date', start).lte('start_date', end);
    }

    const { data, error } = await query;
    if (error) throw new Error(`getEvents failed: ${error.message}`);

    const today = todayISO();
    const rows = (data ?? []) as unknown as EventRow[];
    return rows.map((row) => shapeEvent(row, locale, today));
  },
);

type EventDetailRow = EventRow & {
  craft: CraftRefRow | null;
  group: GroupRow | null;
};

/** イベント詳細。該当が無ければ null（呼び出し側で notFound()）。 */
export const getEventBySlug = cache(
  async (slug: string, locale: Locale): Promise<EventDetail | null> => {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('events')
      .select(
        '*, event_translations(*), craft:crafts(slug, region, craft_translations(*)), group:groups(*, group_translations(*))',
      )
      .eq('slug', slug)
      .in('status', ['published', 'ended'])
      .maybeSingle();

    if (error) throw new Error(`getEventBySlug failed: ${error.message}`);
    if (!data) return null;

    const row = data as unknown as EventDetailRow;
    const base = shapeEvent(row, locale, todayISO());
    return {
      ...base,
      craft: shapeCraftRef(row.craft, locale),
      group: row.group ? shapeGroup(row.group, locale) : null,
    };
  },
);
