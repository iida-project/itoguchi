import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage, resolveOgParams } from '@/lib/og/image';

export const alt = 'いとぐち / Itoguchi — いとぐちについて';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Image({ params }: { params: { locale: string } }) {
  const { locale } = await resolveOgParams(params);
  const t = await getTranslations({ locale, namespace: 'About' });
  return renderOgImage({
    locale,
    kicker: 'About',
    title: t('title'),
    note: t('intro'),
  });
}
