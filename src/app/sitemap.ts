import type { MetadataRoute } from 'next';
import { getArticles, getCrafts, getEvents } from '@/lib/data';
import { absUrl } from '@/lib/seo/config';

/**
 * 動的サイトマップ（docs/14）。app 直下（`[locale]` の外）なので locale は自前で回す。
 * URL は絶対（metadataBase はサイトマップに適用されない）。1 論理ページ = 1 エントリで、
 * `alternates.languages` に ja / en / x-default を出す。**en は EN 訳が公開済みのときだけ**含める。
 */

const STATIC_PATHS = ['', '/crafts', '/experiences', '/events', '/articles', '/about', '/privacy'];

/** slug + isFallback を持つ一覧から「EN 公開済み」の slug 集合を作る。 */
function enPublishedSlugs<T extends { slug: string; isFallback: boolean }>(items: T[]): Set<string> {
  return new Set(items.filter((i) => !i.isFallback).map((i) => i.slug));
}

function entry(path: string, hasEn: boolean): MetadataRoute.Sitemap[number] {
  const languages: Record<string, string> = {
    ja: absUrl('ja', path),
    'x-default': absUrl('ja', path),
  };
  if (hasEn) languages.en = absUrl('en', path);
  return { url: absUrl('ja', path), alternates: { languages } };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [craftsJa, craftsEn, eventsJa, eventsEn, articlesJa, articlesEn] = await Promise.all([
    getCrafts('ja'),
    getCrafts('en'),
    getEvents('ja'),
    getEvents('en'),
    getArticles('ja'),
    getArticles('en'),
  ]);

  const craftEn = enPublishedSlugs(craftsEn);
  const eventEn = enPublishedSlugs(eventsEn);
  const articleEn = enPublishedSlugs(articlesEn);

  const entries: MetadataRoute.Sitemap = [];

  // 静的ページ（日英とも messages で存在）
  for (const path of STATIC_PATHS) entries.push(entry(path, true));

  // 動的ページ（ja=全 published、en=EN 訳公開済みのみ）
  for (const c of craftsJa) entries.push(entry(`/crafts/${c.slug}`, craftEn.has(c.slug)));
  for (const e of eventsJa) entries.push(entry(`/events/${e.slug}`, eventEn.has(e.slug)));
  for (const a of articlesJa) entries.push(entry(`/articles/${a.slug}`, articleEn.has(a.slug)));

  return entries;
}
