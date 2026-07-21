import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, type Locale } from '@/i18n/routing';
import { getCrafts } from '@/lib/data';
import { CraftCard } from '@/components/crafts/CraftCard';
import { Reveal } from '@/components/ui/Reveal';

// 工芸一覧は ISR（工芸詳細と同じく 1 時間）
export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'Crafts' });
  return { title: t('listTitle') };
}

export default async function CraftsPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const [t, crafts] = await Promise.all([
    getTranslations('Crafts'),
    getCrafts(locale as Locale),
  ]);

  return (
    <div className="mx-auto max-w-content px-6 py-section-sm md:py-section">
      <header>
        <h1 className="text-display">{t('listTitle')}</h1>
        <p className="mt-3 max-w-reading text-body-lg text-muted">{t('listLead')}</p>
      </header>

      {crafts.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {crafts.map((craft, i) => (
            <Reveal key={craft.id} index={i}>
              <CraftCard craft={craft} />
            </Reveal>
          ))}
        </div>
      ) : (
        <p className="mt-8 text-body text-muted">{t('empty')}</p>
      )}
    </div>
  );
}
