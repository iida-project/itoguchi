import type { Locale } from '@/i18n/routing';
import type { CraftDetail, EventDetail, ArticleDetail } from '@/lib/data/types';
import { SITE_URL, absUrl, siteName } from './config';

/**
 * JSON-LD ビルダー（docs/14）。返り値は `@context` 付き plain object。
 * `undefined` の項目は JSON.stringify が落とすので明示的に prune しない。
 * URL は絶対（`absUrl`）で出す。
 */

export type JsonLdObject = Record<string, unknown>;
const CONTEXT = 'https://schema.org';

/** サイト名は locale 側を主、もう一方を alternateName に置く（同一実体であることを示す）。 */
function names(locale: Locale) {
  return {
    name: siteName(locale),
    alternateName: siteName(locale === 'ja' ? 'en' : 'ja'),
  };
}

export function websiteJsonLd(locale: Locale): JsonLdObject {
  return {
    '@context': CONTEXT,
    '@type': 'WebSite',
    url: SITE_URL,
    ...names(locale),
    inLanguage: locale === 'ja' ? 'ja-JP' : 'en-US',
  };
}

export function organizationJsonLd(locale: Locale, description: string): JsonLdObject {
  return {
    '@context': CONTEXT,
    '@type': 'Organization',
    ...names(locale),
    url: SITE_URL,
    description,
    areaServed: '南信州（飯田・下伊那）',
  };
}

/** パンくず。items の path は locale を含まない（例 '/crafts'）。 */
export function breadcrumbJsonLd(
  locale: Locale,
  items: Array<{ name: string; path: string }>,
): JsonLdObject {
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absUrl(locale, it.path),
    })),
  };
}

/** 工芸 = TouristAttraction（valid だが Google リッチリザルト対象外・AIO 用）。 */
export function craftJsonLd(craft: CraftDetail, locale: Locale): JsonLdObject {
  const maker = craft.groups[0] ?? null;
  const geo =
    maker && maker.lat != null && maker.lng != null
      ? { '@type': 'GeoCoordinates', latitude: maker.lat, longitude: maker.lng }
      : undefined;
  return {
    '@context': CONTEXT,
    '@type': 'TouristAttraction',
    name: craft.name,
    description: craft.tagline ?? craft.overview ?? undefined,
    address: maker?.address ?? craft.region ?? undefined,
    geo,
    image: craft.heroImageUrl ?? undefined,
    url: absUrl(locale, `/crafts/${craft.slug}`),
  };
}

/** イベント = Event。fee は自由記述なので offers は付けない。date-only startDate は有効。 */
export function eventJsonLd(event: EventDetail, locale: Locale): JsonLdObject {
  const geo =
    event.lat != null && event.lng != null
      ? { '@type': 'GeoCoordinates', latitude: event.lat, longitude: event.lng }
      : undefined;
  return {
    '@context': CONTEXT,
    '@type': 'Event',
    name: event.title,
    startDate: event.startDate,
    endDate: event.endDate ?? undefined,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.venue ?? event.group?.name ?? undefined,
      address: event.address ?? event.group?.address ?? undefined,
      geo,
    },
    organizer: event.group ? { '@type': 'Organization', name: event.group.name } : undefined,
    description: event.description ?? undefined,
    url: absUrl(locale, `/events/${event.slug}`),
  };
}

/** 記事 = Article。著者は無いのでサイト Organization を author/publisher に。 */
export function articleJsonLd(article: ArticleDetail, locale: Locale): JsonLdObject {
  const org = { '@type': 'Organization', name: siteName(locale), url: SITE_URL };
  return {
    '@context': CONTEXT,
    '@type': 'Article',
    headline: article.title,
    datePublished: article.publishedAt ?? undefined,
    image: article.thumbnail ?? undefined,
    author: org,
    publisher: org,
    mainEntityOfPage: absUrl(locale, `/articles/${article.slug}`),
  };
}
