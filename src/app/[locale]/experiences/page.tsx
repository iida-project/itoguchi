import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { getExperiences } from '@/lib/data';
import type { Availability } from '@/lib/data/types';
import { ExperienceCard } from '@/components/experiences/ExperienceCard';
import {
  ExperienceFilterList,
  type ExperienceFilterItem,
} from '@/components/experiences/ExperienceFilterList';

// 体験一覧は ISR（searchParams はサーバーで読まず、フィルタはクライアント側＝静的維持）
export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'Experiences' });
  return { title: t('title') };
}

export default async function ExperiencesPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const [t, experiences] = await Promise.all([
    getTranslations('Experiences'),
    getExperiences(locale as Locale),
  ]);

  // フィルタ選択肢を全件から導出
  const craftsMap = new Map<string, string>();
  const regionsSet = new Set<string>();
  const availabilitySet = new Set<Availability>();
  for (const exp of experiences) {
    if (exp.craft) craftsMap.set(exp.craft.slug, exp.craft.name);
    if (exp.craft?.region) regionsSet.add(exp.craft.region);
    availabilitySet.add(exp.availability);
  }
  const crafts = [...craftsMap].map(([slug, name]) => ({ slug, name }));
  const regions = [...regionsSet];
  const availabilities = [...availabilitySet];

  // カードはサーバーで確定。フィルタ用メタと一緒に渡す
  const items: ExperienceFilterItem[] = experiences.map((exp) => ({
    id: exp.id,
    craftSlug: exp.craft?.slug ?? null,
    region: exp.craft?.region ?? null,
    availability: exp.availability,
    node: <ExperienceCard experience={exp} craft={exp.craft} />,
  }));

  return (
    <div className="mx-auto max-w-content px-6 py-section-sm md:py-section">
      <header>
        <h1 className="text-display">{t('title')}</h1>
        <p className="mt-3 max-w-reading text-body-lg text-muted">{t('lead')}</p>
      </header>

      <div className="mt-8">
        <Suspense fallback={<FallbackGrid items={items} />}>
          <ExperienceFilterList
            items={items}
            crafts={crafts}
            regions={regions}
            availabilities={availabilities}
          />
        </Suspense>
      </div>
    </div>
  );
}

// Suspense fallback（＝プリレンダリング時の内容）。全カードを出して SEO/初期表示を確保
function FallbackGrid({ items }: { items: ExperienceFilterItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <div key={it.id}>{it.node}</div>
      ))}
    </div>
  );
}
