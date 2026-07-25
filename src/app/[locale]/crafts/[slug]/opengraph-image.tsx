import { routing } from '@/i18n/routing';
import { getCrafts, getCraftBySlug } from '@/lib/data';
import { craftNumberMap } from '@/lib/craftNumber';
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage, resolveOgParams } from '@/lib/og/image';

export const alt = 'いとぐち / Itoguchi — 南信州の伝統工芸';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const revalidate = 3600;

/**
 * メタデータルートは route module 扱いなので、**パス上の全動的パラメータ**を返す必要がある
 * （親 layout の `generateStaticParams` は継承されない）。locale × slug の直積にする。
 */
export async function generateStaticParams() {
  const crafts = await getCrafts(routing.defaultLocale); // slug は locale 非依存
  return routing.locales.flatMap((locale) => crafts.map((c) => ({ locale, slug: c.slug })));
}

export default async function Image({ params }: { params: { locale: string; slug: string } }) {
  const { locale, slug } = await resolveOgParams(params);
  const [craft, crafts] = await Promise.all([
    getCraftBySlug(slug, locale),
    getCrafts(routing.defaultLocale),
  ]);
  // 通し番号はホーム・一覧・詳細と同じ正本（craftNumberMap）から引く
  const no = craftNumberMap(crafts).get(slug);

  return renderOgImage({
    locale,
    kicker: [no ? `No. ${String(no).padStart(2, '0')}` : null, 'The Craft']
      .filter(Boolean)
      .join(' · '),
    title: craft?.name ?? 'いとぐち',
    latin: craft?.nameLatin ?? null, // locale にも公開状態にも依存しない英字（docs/18）
    note: craft?.tagline ?? null,
  });
}
