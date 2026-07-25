import { routing } from '@/i18n/routing';
import { getEvents, getEventBySlug } from '@/lib/data';
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage, resolveOgParams } from '@/lib/og/image';

export const alt = 'いとぐち / Itoguchi — 南信州の伝統工芸';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const revalidate = 3600;

export async function generateStaticParams() {
  const events = await getEvents(routing.defaultLocale);
  return routing.locales.flatMap((locale) => events.map((e) => ({ locale, slug: e.slug })));
}

/** ISO の 'YYYY-MM-DD' を kicker 用の '2026.09.13' にする（英字併走なので数字表記）。 */
const dotted = (iso: string) => iso.replaceAll('-', '.');

export default async function Image({ params }: { params: { locale: string; slug: string } }) {
  const { locale, slug } = await resolveOgParams(params);
  const event = await getEventBySlug(slug, locale);

  return renderOgImage({
    locale,
    kicker: [event ? dotted(event.startDate) : null, 'Event'].filter(Boolean).join(' · '),
    title: event?.title ?? 'いとぐち',
    note: event?.venue ?? null,
  });
}
