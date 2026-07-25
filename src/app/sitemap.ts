import type { MetadataRoute } from 'next';
import { getArticles, getCrafts, getEvents } from '@/lib/data';
import { absUrl } from '@/lib/seo/config';

/**
 * 動的サイトマップ（docs/14）。app 直下（`[locale]` の外）なので locale は自前で回す。
 * URL は絶対（metadataBase はサイトマップに適用されない）。
 *
 * **言語版ごとに `<url>` を 1 つ作り、それぞれに自分自身を含む全言語の `xhtml:link` を書く**
 * （Google の hreflang 仕様。ja だけ列挙して en を alternate にしか書かないと相互参照が
 * 成立せず、hreflang アノテーションが無視される）。**en は EN 訳が公開済みのときだけ**出す。
 */

// メタデータルートは既定でビルド時に固定される。管理パネルからの追加を拾うため ISR にする
// （即時反映は `revalidatePublic()` の `revalidatePath('/sitemap.xml')` 側で担保）。
export const revalidate = 3600;

const STATIC_PATHS = ['', '/crafts', '/experiences', '/events', '/articles', '/about', '/privacy'];

/** slug + isFallback を持つ一覧から「EN 公開済み」の slug 集合を作る。 */
function enPublishedSlugs<T extends { slug: string; isFallback: boolean }>(items: T[]): Set<string> {
  return new Set(items.filter((i) => !i.isFallback).map((i) => i.slug));
}

/** 1 論理ページ → 言語版ぶんの `<url>`（全エントリが同じ alternates を共有する）。 */
function urlsFor(path: string, hasEn: boolean): MetadataRoute.Sitemap {
  const languages: Record<string, string> = {
    ja: absUrl('ja', path),
    'x-default': absUrl('ja', path),
  };
  if (hasEn) languages.en = absUrl('en', path);

  const alternates = { languages };
  const urls: MetadataRoute.Sitemap = [{ url: absUrl('ja', path), alternates }];
  if (hasEn) urls.push({ url: absUrl('en', path), alternates });
  return urls;
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
  for (const path of STATIC_PATHS) entries.push(...urlsFor(path, true));

  // 動的ページ（ja=全 published、en=EN 訳公開済みのみ）
  for (const c of craftsJa) entries.push(...urlsFor(`/crafts/${c.slug}`, craftEn.has(c.slug)));
  for (const e of eventsJa) entries.push(...urlsFor(`/events/${e.slug}`, eventEn.has(e.slug)));
  for (const a of articlesJa) entries.push(...urlsFor(`/articles/${a.slug}`, articleEn.has(a.slug)));

  return entries;
}
