import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { ThreadDivider } from '@/components/ui/ThreadDivider';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'About' });
  return { title: t('title') };
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const t = await getTranslations('About');

  const sections = [
    { title: t('purposeTitle'), body: t('purposeBody') },
    { title: t('guideTitle'), body: t('guideBody') },
    { title: t('sayoTitle'), body: t('sayoBody') },
    { title: t('operatorTitle'), body: t('operatorBody') },
    { title: t('contactTitle'), body: t('contactBody') },
  ];

  return (
    <div className="mx-auto max-w-reading px-6 py-section-sm md:py-section">
      <h1 className="font-display text-display">{t('title')}</h1>
      <p className="mt-4 text-body-lg text-muted">{t('intro')}</p>

      <ThreadDivider className="my-section-sm" />

      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-h2">{section.title}</h2>
            <p className="mt-3 text-body-lg">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
