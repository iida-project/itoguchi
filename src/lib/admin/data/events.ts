import 'server-only';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';
import type { Tables } from '@/types/database.types';
import { pickTranslations } from './_shared';

export type EventRow = Tables<'events'>;
export type EventTranslationRow = Tables<'event_translations'>;
export type EventListItem = EventRow & { translations: EventTranslationRow[] };
export type EventEdit = { base: EventRow; ja: EventTranslationRow | null; en: EventTranslationRow | null };

export async function listEvents(): Promise<EventListItem[]> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('events')
    .select('*, translations:event_translations(*)')
    .order('start_date', { ascending: false });
  if (error) throw new Error(`listEvents failed: ${error.message}`);
  return (data ?? []) as unknown as EventListItem[];
}

export async function getEvent(id: string): Promise<EventEdit | null> {
  const supabase = createAdminSupabaseClient();
  const { data, error } = await supabase
    .from('events')
    .select('*, translations:event_translations(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(`getEvent failed: ${error.message}`);
  if (!data) return null;

  const { translations, ...base } = data as unknown as EventListItem;
  const { ja, en } = pickTranslations(translations);
  return { base: base as EventRow, ja, en };
}
