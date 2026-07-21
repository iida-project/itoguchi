/**
 * UI 向けに整形したデータ取得の返り値型。
 * 生成型（database.types.ts の Row）をそのまま渡さず、翻訳解決済み・camelCase の
 * フラットな形にしてページ側の扱いを簡単にする。
 *
 * `isFallback`: 要求 locale の翻訳が無く日本語へフォールバックした場合 true（§5）。
 * `isProvisional`: 交渉用シードの推測情報（※確認中）を含む場合 true（§10）。
 */

export type Availability = 'anytime' | 'seasonal' | 'request';
export type EventStatus = 'draft' | 'published' | 'ended';
export type SpotType = 'shop' | 'museum' | 'other';

export type CraftListItem = {
  id: string;
  slug: string;
  region: string | null;
  heroImageUrl: string | null;
  name: string;
  tagline: string | null;
  overview: string | null;
  isProvisional: boolean;
  isFallback: boolean;
};

export type CraftStepItem = {
  id: string;
  position: number;
  imageUrl: string | null;
  imageAlt: string | null;
  title: string | null;
  description: string | null;
  isFallback: boolean;
};

export type GroupItem = {
  id: string;
  slug: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  contact: string | null;
  snsUrls: string[];
  name: string;
  description: string | null;
  isProvisional: boolean;
  isFallback: boolean;
};

export type ExperienceItem = {
  id: string;
  availability: Availability;
  priceNote: string | null;
  durationNote: string | null;
  seasonNote: string | null;
  applyMethod: string | null;
  title: string | null;
  description: string | null;
  group: GroupItem | null;
  isProvisional: boolean;
  isFallback: boolean;
};

/** 体験一覧（工芸の文脈付き） */
export type ExperienceListItem = ExperienceItem & {
  craft: { slug: string; name: string; region: string | null } | null;
};

export type SpotItem = {
  id: string;
  type: SpotType;
  address: string | null;
  lat: number | null;
  lng: number | null;
  url: string | null;
  name: string | null;
  description: string | null;
  isFallback: boolean;
};

export type EventListItem = {
  id: string;
  slug: string;
  status: EventStatus;
  /** ISO 日付 'YYYY-MM-DD' */
  startDate: string;
  endDate: string | null;
  /** (end_date ?? start_date) < 今日 で終了扱い（§7: クエリ側導出） */
  isEnded: boolean;
  timeNote: string | null;
  venue: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  feeNote: string | null;
  capacityNote: string | null;
  applyUrl: string | null;
  applyNote: string | null;
  craftId: string | null;
  title: string;
  description: string | null;
  isProvisional: boolean;
  isFallback: boolean;
};

export type EventDetail = EventListItem & {
  craft: { slug: string; name: string } | null;
  group: GroupItem | null;
};

export type ArticleListItem = {
  id: string;
  slug: string;
  thumbnail: string | null;
  thumbnailAlt: string | null;
  publishedAt: string | null;
  craftId: string | null;
  title: string;
  excerpt: string | null;
  isFallback: boolean;
};

export type ArticleDetail = ArticleListItem & {
  content: string | null;
};

export type CraftDetail = CraftListItem & {
  history: string | null;
  steps: CraftStepItem[];
  groups: GroupItem[];
  experiences: ExperienceItem[];
  upcomingEvents: EventListItem[];
  spots: SpotItem[];
  articles: ArticleListItem[];
};

export type HomeData = {
  upcomingEvents: EventListItem[];
  crafts: CraftListItem[];
  latestArticles: ArticleListItem[];
};
