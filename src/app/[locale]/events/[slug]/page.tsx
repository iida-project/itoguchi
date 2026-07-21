import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { getEvents, getEventBySlug } from '@/lib/data';
import { formatDate } from '@/lib/date';
import { JapaneseOnlyBanner } from '@/components/layout/JapaneseOnlyBanner';
import { Badge } from '@/components/ui/Badge';
import { GoogleMapLink } from '@/components/map/GoogleMapLink';
import { buttonClasses } from '@/components/ui/buttonStyles';

export const revalidate = 3600;
export const dynamicParams = true;

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

// published + ended の slug を静的化（ended もアーカイブとして詳細ページを持つ）
export async function generateStaticParams() {
  const events = await getEvents(routing.defaultLocale);
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const event = await getEventBySlug(slug, locale);
  if (!event) return {};
  return {
    title: event.title,
    description: event.description?.slice(0, 120) ?? undefined,
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const [t, tCommon, event] = await Promise.all([
    getTranslations('Events'),
    getTranslations('Common'),
    getEventBySlug(slug, locale as Locale),
  ]);
  if (!event) {
    notFound();
  }

  const dateText =
    formatDate(event.startDate, locale) +
    (event.endDate && event.endDate !== event.startDate
      ? ` – ${formatDate(event.endDate, locale)}`
      : '') +
    (event.timeNote ? `　${event.timeNote}` : '');

  return (
    <>
      {locale === 'en' && event.isFallback && <JapaneseOnlyBanner />}

      <div className="mx-auto max-w-reading px-6 py-section-sm md:py-section">
        {/* 関連工芸 */}
        {event.craft && (
          <Link
            href={`/crafts/${event.craft.slug}`}
            className="text-caption font-medium text-primary-700 hover:underline"
          >
            {event.craft.name} ▸
          </Link>
        )}

        <div className="mt-2 flex items-start justify-between gap-4">
          <h1 className="font-display text-display">{event.title}</h1>
          {event.isEnded && <Badge variant="ended">{t('statusEnded')}</Badge>}
        </div>

        {event.isProvisional && (
          <p className="mt-2 text-caption text-muted">{tCommon('provisional')}</p>
        )}

        {event.description && (
          <p className="mt-4 text-body-lg text-muted">{event.description}</p>
        )}

        <dl className="mt-8">
          <Field label={t('dateLabel')}>
            <p className="text-body">{dateText}</p>
          </Field>

          {(event.venue || event.address) && (
            <Field label={t('venueLabel')}>
              {event.venue && <p className="text-body">{event.venue}</p>}
              <GoogleMapLink
                name={event.venue}
                address={event.address}
                lat={event.lat}
                lng={event.lng}
              />
            </Field>
          )}

          {event.feeNote && (
            <Field label={t('feeLabel')}>
              <p className="text-body">{event.feeNote}</p>
            </Field>
          )}

          {event.capacityNote && (
            <Field label={t('capacityLabel')}>
              <p className="text-body">{event.capacityNote}</p>
            </Field>
          )}

          {(event.applyUrl || event.applyNote) && (
            <Field label={t('applyLabel')}>
              {event.applyUrl && (
                <a
                  href={event.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses('primary')}
                >
                  {t('applyButton')} <span aria-hidden="true">↗</span>
                </a>
              )}
              {event.applyNote && (
                <p className={event.applyUrl ? 'mt-3 text-body' : 'text-body'}>
                  {event.applyNote}
                </p>
              )}
            </Field>
          )}

          {event.group && (
            <Field label={t('organizerLabel')}>
              <p className="text-body">{event.group.name}</p>
              {event.group.contact && (
                <p className="mt-1 text-caption text-muted">{event.group.contact}</p>
              )}
              <GoogleMapLink
                name={event.group.name}
                address={event.group.address}
                lat={event.group.lat}
                lng={event.group.lng}
              />
            </Field>
          )}

          {event.craft && (
            <Field label={t('relatedCraft')}>
              <Link
                href={`/crafts/${event.craft.slug}`}
                className="text-body text-primary-700 hover:underline"
              >
                {event.craft.name} ▸
              </Link>
            </Field>
          )}
        </dl>

        <div className="mt-8">
          <Link href="/events" className="text-caption text-primary-700 hover:underline">
            ← {tCommon('backToList')}
          </Link>
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-t border-border py-4">
      <dt className="text-caption font-medium text-muted">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}
