import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage, resolveOgParams } from '@/lib/og/image';

/**
 * ホームの OGP 画像（docs/15）。
 *
 * **公開 10 セグメントすべてに 1 枚ずつ置く必要がある。** Next のメタデータ解決は
 * `openGraph` を祖先から継承せず丸ごと置換し、ファイル規約の画像は「そのセグメントの
 * `openGraph` が `images` を持たないとき」にだけ注入されるため、ここ 1 枚では
 * 配下のページに効かない。
 */
export const alt = 'いとぐち / Itoguchi — 南信州の伝統工芸';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const revalidate = 86400; // ホームページ本体と揃える

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Image({ params }: { params: { locale: string } }) {
  const { locale } = await resolveOgParams(params);
  const [tSite, tFooter] = await Promise.all([
    getTranslations({ locale, namespace: 'Site' }),
    getTranslations({ locale, namespace: 'Footer' }),
  ]);
  return renderOgImage({
    locale,
    kicker: 'The doorway to Minami-Shinshu crafts',
    title: tSite('title'),
    note: tFooter('brandLead'),
  });
}
