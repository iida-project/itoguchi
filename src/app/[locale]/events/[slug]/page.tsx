import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { Link } from '@/i18n/navigation';
import { getEvents, getEventBySlug } from '@/lib/data';
import { formatDate } from '@/lib/date';
import { cn } from '@/lib/cn';
import { JapaneseOnlyBanner } from '@/components/layout/JapaneseOnlyBanner';
import { Band } from '@/components/layout/Band';
import { Badge } from '@/components/ui/Badge';
import { Kicker, SectionHeading } from '@/components/ui/SectionHeading';
import { LinkButton } from '@/components/ui/LinkButton';
import { GoogleMapLink } from '@/components/map/GoogleMapLink';
import { EventApplyCard } from '@/components/events/EventApplyCard';

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

/**
 * イベント詳細（DESIGN.md §6「一覧ページ・外挿ルール」= 工芸詳細の型を借りる）。
 * 面の順序は 2（Hero 帯）→ 1（2 カラム本文）→ 3（関連工芸）→ 4（フッター）。
 *
 * **Hero はテキスト Hero**。`events` テーブルに画像カラムが無く、見た目のためにスキーマを
 * 増やさない方針（docs/18・19）のため、工芸詳細 Hero の「SP 版タイトルブロック」と同じ
 * 構成（kicker → display → リード → メタ）を借りる。
 * 右の申込カードは §5.12 の追従サイドバーカードと同じ体裁で、SP ではインラインに落とす。
 */
export default async function EventDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const [t, tCommon, tNav, event] = await Promise.all([
    getTranslations('Events'),
    getTranslations('Common'),
    getTranslations('Nav'),
    getEventBySlug(slug, locale as Locale),
  ]);
  if (!event) {
    notFound();
  }

  const dateText =
    formatDate(event.startDate, locale) +
    (event.endDate && event.endDate !== event.startDate
      ? ` – ${formatDate(event.endDate, locale)}`
      : '');

  // kicker は `Event · 8月23日(土) · 遠山ふじ糸`（英字 + 和文の混在は font-synthesis:none で吸収）
  const kicker = [t('detailKicker'), dateText, event.craft?.name].filter(Boolean).join(' · ');

  const applyCard = <EventApplyCard event={event} locale={locale as Locale} />;

  return (
    <>
      {/* EN 未訳（ja フォールバック）でこのページに来た場合のみバナー */}
      {locale === 'en' && event.isFallback && <JapaneseOnlyBanner />}

      <div className="mx-auto max-w-content px-6 pt-5 md:px-8">
        <nav aria-label="breadcrumb" className="text-[12px] text-muted">
          <Link href="/" className="text-primary-600 hover:underline">
            {tNav('home')}
          </Link>
          <span className="mx-3 text-border-strong">/</span>
          <Link href="/events" className="text-primary-600 hover:underline">
            {t('listTitle')}
          </Link>
          <span className="mx-3 text-border-strong">/</span>
          <span>{event.title}</span>
        </nav>
      </div>

      {/* 面 2: Hero 帯（写真が無いので文字で組む） */}
      <Band tone="warm" padding="none" bordered className="mt-5">
        <div className={cn('py-12 md:py-16', event.isEnded && 'opacity-[0.72]')}>
          <Kicker rule={40} className="mb-5">
            {kicker}
          </Kicker>
          <div className="flex flex-wrap items-start gap-x-5 gap-y-3">
            <h1 className="font-display text-display">{event.title}</h1>
            {event.isEnded && <Badge variant="ended">{t('statusEnded')}</Badge>}
          </div>
          {event.description && (
            <p className="mt-5 max-w-reading font-display text-lead text-primary-700">
              {event.description}
            </p>
          )}
          {event.isProvisional && (
            <p className="mt-3 text-caption text-muted">{tCommon('provisional')}</p>
          )}
          {/*
            会場・料金・定員は Hero に出さない。**本文の dl（全項目）と申込カード（申込サマリ）の
            2 箇所に役割を分ける**（Hero にも並べると同じ事実が 3 回出て読み手が数える羽目になる）。
            日付だけは kicker に入れて Hero でも分かるようにしてある。
          */}
        </div>
      </Band>

      {/* 面 1: 2 カラム（本文 / 追従する申込カード） */}
      <Band padding="none">
        <div className="py-section-sm md:py-section lg:grid lg:grid-cols-[1fr_300px] lg:gap-[60px]">
          <div className="min-w-0">
            {/* SP では追従できないので、本文の先頭にインライン展開する（§8）。
                PC 側とは display で排他になるため、同時に見えることはない。 */}
            <div className="mb-10 lg:hidden">{applyCard}</div>

            <dl>
              <Field label={t('dateLabel')}>
                <p className="text-body">
                  {dateText}
                  {event.timeNote ? `　${event.timeNote}` : ''}
                </p>
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
                  {event.applyUrl && !event.isEnded && (
                    <a
                      href={event.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 border-b border-gold-600 pb-0.5 text-body font-medium text-primary-600 hover:text-primary-700"
                    >
                      {t('applyButton')} <span aria-hidden="true">↗</span>
                    </a>
                  )}
                  {event.applyNote && (
                    <p className={event.applyUrl && !event.isEnded ? 'mt-3 text-body' : 'text-body'}>
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
            </dl>

            <div className="mt-10">
              <Link href="/events" className="text-caption text-primary-700 hover:underline">
                ← {t('backToEvents')}
              </Link>
            </div>
          </div>

          {/* 追従する申込カード（§5.12 の型）。SP では上の本文先頭に出す */}
          <aside className="hidden lg:block">
            <div className="lg:sticky lg:top-[100px]">{applyCard}</div>
          </aside>
        </div>
      </Band>

      {/* 面 3: 関連工芸への導線（正本ページへ戻す） */}
      {event.craft && (
        <Band tone="surface" padding="block" bordered>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <SectionHeading
                kicker={t('relatedCraft')}
                title={t('detailCraftTitle')}
                en={t('detailCraftEn')}
                className="mb-4"
              />
              <p className="font-display text-lead text-primary-700">{event.craft.name}</p>
            </div>
            <LinkButton href={`/crafts/${event.craft.slug}`} size="lg">
              {t('detailCraftCta')} →
            </LinkButton>
          </div>
        </Band>
      )}
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
