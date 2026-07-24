import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { getCrafts, getSiteStats } from '@/lib/data';
import { craftNumberMap } from '@/lib/craftNumber';
import { Band } from '@/components/layout/Band';
import { PageHero } from '@/components/layout/PageHero';
import { CraftCard } from '@/components/crafts/CraftCard';
import { LinkButton } from '@/components/ui/LinkButton';
import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Stat } from '@/components/ui/Stat';

// 工芸一覧は ISR（工芸詳細と同じく 1 時間）
export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'Crafts' });
  return { title: t('listTitle'), description: t('listLead') };
}

/**
 * 工芸一覧（DESIGN.md §6「一覧ページ・外挿ルール」）。
 * 面の順序は 1（Hero）→ 2（工芸グリッド）→ 3（締めの帯）→ 4（フッター）。
 *
 * 借りている型: ページ Hero = カレンダーページ（`PageHero` + スタッツのカード化）、
 * グリッド = ホーム #4 の `bg-warm` 全幅バンド + 通し番号付きカード。**新しい部品は作らない。**
 */
export default async function CraftsPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const [t, tCommon, crafts, stats] = await Promise.all([
    getTranslations('Crafts'),
    getTranslations('Common'),
    getCrafts(locale as Locale),
    getSiteStats(locale as Locale),
  ]);

  // 通し番号は工芸ごとに固定（getCrafts の並びが正本。並べ替えで動かさない）
  const numbers = craftNumberMap(crafts);

  return (
    <>
      {/* 面 1: Hero + スタッツ帯（§6「display-xl + スタッツ帯」。帯はホーム #2 と同じ型） */}
      <Band padding="none">
        <div className="pt-14 md:pt-20">
          <PageHero
            kicker={t('listKicker')}
            title={t.rich('listHeading', {
              // 和文は任意の位置で折り返るため、改行位置は文言側で決める（docs/19 の決定）
              br: () => <br />,
              em: (chunks) => <em className="mark-gold not-italic">{chunks}</em>,
            })}
            en={t('listEn')}
          />
          <p className="mt-8 max-w-reading text-body-lg text-muted">{t('listLead')}</p>
          <div className="mt-12 border-t border-border py-8">
            <Stat
              items={[
                { value: stats.crafts, label: tCommon('statCrafts') },
                { value: stats.experiences, label: tCommon('statExperiences') },
                { value: stats.makers, label: tCommon('statMakers') },
              ]}
            />
          </div>
        </div>
      </Band>

      {/* 面 2: 工芸グリッド（全幅の bg-warm。ホーム #4 と同じ型） */}
      <Band tone="warm" padding="block">
        {/* Hero の h1 とカードの h3 のあいだを埋める見出し。視覚的には Hero と重複するので
            読み上げ・アウトライン専用にする（見出しレベルを飛ばさない） */}
        <h2 className="sr-only">{t('listTitle')}</h2>
        {crafts.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {crafts.map((craft, i) => (
              <Reveal key={craft.id} index={i}>
                <CraftCard craft={craft} index={numbers.get(craft.slug)} />
              </Reveal>
            ))}
          </div>
        ) : (
          <p className="text-body text-muted">{t('empty')}</p>
        )}
      </Band>

      {/* 面 3: 締めの帯（次の入口へ渡す） */}
      <Band tone="surface" padding="block" bordered>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <SectionHeading
              kicker={t('outroKicker')}
              title={t('outroTitle')}
              en={t('outroEn')}
              className="mb-4"
            />
            <p className="max-w-reading text-body text-muted">{t('outroLead')}</p>
          </div>
          <div className="flex flex-wrap gap-3.5">
            <LinkButton href="/experiences" size="lg">
              {t('outroCtaExperiences')} →
            </LinkButton>
            <LinkButton href="/events" variant="secondary" size="lg">
              {t('outroCtaEvents')}
            </LinkButton>
          </div>
        </div>
      </Band>
    </>
  );
}
