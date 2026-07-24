/**
 * UI 向けに整形したデータ取得の返り値型。
 * 生成型（database.types.ts の Row）をそのまま渡さず、翻訳解決済み・camelCase の
 * フラットな形にしてページ側の扱いを簡単にする。
 *
 * `isFallback`: 要求 locale の翻訳が無く日本語へフォールバックした場合 true（§5）。
 * `isProvisional`: 交渉用シードの推測情報（※確認中）を含む場合 true（§10）。
 *
 * 末尾が `En` のフィールドは**英字併走（DESIGN §3.3 層 2）用の EN 訳**。
 * 日本語見出しに添える 2 行目であって表示言語ではないので、次の 2 つで null になる:
 * EN が未公開のとき / EN ロケールで見ているとき（同じ言語が 2 行続くため）。
 * **常に任意**として扱い、null でもレイアウトが崩れないようにすること。
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
  /**
   * 工芸名の英字（`crafts.name_latin`）。**locale 非依存**で、EN 未訳でも必ず出せる（§3.3 層 3）。
   * EN 訳の `nameEn` とは別物なので混同しないこと。
   */
  nameLatin: string | null;
  nameEn: string | null;
  taglineEn: string | null;
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
  /** 工程名の英字サブ（§5.5 の 4 層見出し） */
  titleEn: string | null;
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
  /** 担い手名の英字サブ（工芸詳細 04 章の英字行） */
  nameEn: string | null;
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

/**
 * 工芸詳細（正本ページ）。
 *
 * 章見出しは 5 章のうち 01・02 だけが工芸ごとの書き下ろし（DB）で、
 * 03 は工程数（`steps.length`）、04 は担い手名（`groups[].name`）、05 は固定文言から
 * 組み立てる（DESIGN §6「章見出しの調達ルール」）。**文字列の組み立てはページ側の責務**
 * （`messages` の `Crafts.stepsEn` 等に流し込む。この層は next-intl に依存しない）。
 */
export type CraftDetail = CraftListItem & {
  history: string | null;
  /** 01 About の見出し。無ければページ側で固定文言にフォールバック */
  aboutHeading: string | null;
  aboutHeadingEn: string | null;
  /** 02 The Story の見出し */
  storyHeading: string | null;
  storyHeadingEn: string | null;
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
  /** スタッツ帯（§5.8）。1 以下の項目を出さない判定は `Stat` 側が持つ */
  stats: {
    crafts: number;
    experiences: number;
    makers: number;
  };
};
