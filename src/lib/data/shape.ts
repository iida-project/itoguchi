import type { Locale } from '@/i18n/routing';
import type { Tables } from '@/types/database.types';
import { resolveTranslation } from './translations';
import type {
  ArticleDetail,
  ArticleListItem,
  Availability,
  CraftListItem,
  CraftStepItem,
  EventListItem,
  EventStatus,
  ExperienceItem,
  GroupItem,
  SpotItem,
  SpotType,
} from './types';

/*
 * ネスト select の生行を UI 向けの型へ整形するヘルパー群。
 * Supabase の深いネスト推論に依存しすぎないよう、読み取る形を Raw 型として明示し、
 * 各取得関数はクエリ結果をこの Raw 型として受け取ってから整形する。
 */

export type CraftRow = Tables<'crafts'> & {
  craft_translations: Tables<'craft_translations'>[];
};

export type GroupRow = Tables<'groups'> & {
  group_translations: Tables<'group_translations'>[];
};

export type CraftStepRow = Tables<'craft_steps'> & {
  craft_step_translations: Tables<'craft_step_translations'>[];
};

export type ExperienceRow = Tables<'experiences'> & {
  experience_translations: Tables<'experience_translations'>[];
  group: GroupRow | null;
};

export type EventRow = Tables<'events'> & {
  event_translations: Tables<'event_translations'>[];
};

export type SpotRow = Tables<'spots'> & {
  spot_translations: Tables<'spot_translations'>[];
};

export type ArticleRow = Tables<'articles'> & {
  article_translations: Tables<'article_translations'>[];
};

export type EventRowWithGroup = EventRow & { group: GroupRow | null };

/** craft の代表情報のみを埋め込んだ形（イベント・体験一覧の文脈表示用） */
export type CraftRefRow = Pick<Tables<'crafts'>, 'slug' | 'region'> & {
  craft_translations: Tables<'craft_translations'>[];
};

export type CraftDetailRow = CraftRow & {
  craft_steps: CraftStepRow[];
  experiences: ExperienceRow[];
  events: EventRowWithGroup[];
  spots: SpotRow[];
  articles: ArticleRow[];
};

// --- 個別整形 ---------------------------------------------------------------

export function shapeCraftListItem(row: CraftRow, locale: Locale): CraftListItem {
  const { translation, isFallback } = resolveTranslation(row.craft_translations, locale);
  return {
    id: row.id,
    slug: row.slug,
    region: row.region,
    heroImageUrl: row.hero_image_url,
    name: translation?.name ?? row.slug,
    tagline: translation?.tagline ?? null,
    overview: translation?.overview ?? null,
    isProvisional: row.is_provisional || Boolean(translation?.is_provisional),
    isFallback,
  };
}

export function shapeGroup(row: GroupRow, locale: Locale): GroupItem {
  const { translation, isFallback } = resolveTranslation(row.group_translations, locale);
  return {
    id: row.id,
    slug: row.slug,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    contact: row.contact,
    snsUrls: row.sns_urls ?? [],
    name: translation?.name ?? row.slug,
    description: translation?.description ?? null,
    isProvisional: row.is_provisional || Boolean(translation?.is_provisional),
    isFallback,
  };
}

export function shapeStep(row: CraftStepRow, locale: Locale): CraftStepItem {
  const { translation, isFallback } = resolveTranslation(
    row.craft_step_translations,
    locale,
  );
  return {
    id: row.id,
    position: row.position,
    imageUrl: row.image_url,
    imageAlt: translation?.image_alt ?? null,
    title: translation?.title ?? null,
    description: translation?.description ?? null,
    isFallback,
  };
}

export function shapeExperience(row: ExperienceRow, locale: Locale): ExperienceItem {
  const { translation, isFallback } = resolveTranslation(
    row.experience_translations,
    locale,
  );
  return {
    id: row.id,
    availability: row.availability as Availability,
    priceNote: row.price_note,
    durationNote: row.duration_note,
    seasonNote: row.season_note,
    applyMethod: row.apply_method,
    title: translation?.title ?? null,
    description: translation?.description ?? null,
    group: row.group ? shapeGroup(row.group, locale) : null,
    isProvisional: row.is_provisional || Boolean(translation?.is_provisional),
    isFallback,
  };
}

export function shapeSpot(row: SpotRow, locale: Locale): SpotItem {
  const { translation, isFallback } = resolveTranslation(row.spot_translations, locale);
  return {
    id: row.id,
    type: row.type as SpotType,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    url: row.url,
    name: translation?.name ?? row.name ?? null,
    description: translation?.description ?? null,
    isFallback,
  };
}

export function shapeEvent(row: EventRow, locale: Locale, today: string): EventListItem {
  const { translation, isFallback } = resolveTranslation(row.event_translations, locale);
  const status = row.status as EventStatus;
  const effectiveEnd = row.end_date ?? row.start_date;
  return {
    id: row.id,
    slug: row.slug,
    status,
    startDate: row.start_date,
    endDate: row.end_date,
    isEnded: status === 'ended' || effectiveEnd < today,
    timeNote: row.time_note,
    venue: row.venue,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    feeNote: row.fee_note,
    capacityNote: row.capacity_note,
    applyUrl: row.apply_url,
    applyNote: row.apply_note,
    craftId: row.craft_id,
    title: translation?.title ?? row.slug,
    description: translation?.description ?? null,
    isProvisional: row.is_provisional || Boolean(translation?.is_provisional),
    isFallback,
  };
}

export function shapeArticleListItem(row: ArticleRow, locale: Locale): ArticleListItem {
  const { translation, isFallback } = resolveTranslation(
    row.article_translations,
    locale,
  );
  return {
    id: row.id,
    slug: row.slug,
    thumbnail: row.thumbnail,
    thumbnailAlt: translation?.thumbnail_alt ?? null,
    publishedAt: row.published_at,
    craftId: row.craft_id,
    title: translation?.title ?? row.slug,
    excerpt: translation?.excerpt ?? null,
    isFallback,
  };
}

export function shapeArticleDetail(row: ArticleRow, locale: Locale): ArticleDetail {
  const base = shapeArticleListItem(row, locale);
  const { translation } = resolveTranslation(row.article_translations, locale);
  return { ...base, content: translation?.content ?? null };
}

/** 埋め込んだ craft の代表情報を解決する（イベント・体験一覧の文脈表示用） */
export function shapeCraftRef(
  row: CraftRefRow | null,
  locale: Locale,
): { slug: string; name: string; region: string | null } | null {
  if (!row) return null;
  const { translation } = resolveTranslation(row.craft_translations, locale);
  return { slug: row.slug, name: translation?.name ?? row.slug, region: row.region };
}

/** experiences / events から重複を除いた担い手一覧を作る（craft→group 直リンクが無いため） */
export function collectGroups(
  rows: Array<{ group: GroupRow | null }>,
  locale: Locale,
): GroupItem[] {
  const byId = new Map<string, GroupItem>();
  for (const row of rows) {
    if (row.group && !byId.has(row.group.id)) {
      byId.set(row.group.id, shapeGroup(row.group, locale));
    }
  }
  return [...byId.values()];
}
