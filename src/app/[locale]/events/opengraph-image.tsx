import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage, resolveOgParams } from '@/lib/og/image';

export const alt = 'いとぐち / Itoguchi — イベントカレンダー';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const revalidate = 3600;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Image({ params }: { params: { locale: string } }) {
  const { locale } = await resolveOgParams(params);
  const t = await getTranslations({ locale, namespace: 'Events' });
  return renderOgImage({
    locale,
    kicker: 'Calendar of Experiences',
    title: t('listTitle'),
    note: t('lead'),
  });
}
