import { getTranslations, setRequestLocale } from 'next-intl/server';

// docs/01 の骨組み確認用プレースホルダ。本実装はホーム（docs/05）。
type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('Home');

  return (
    <main className="mx-auto flex min-h-screen max-w-[1120px] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-display text-4xl">{t('title')}</h1>
      <p className="text-lg">{t('tagline')}</p>
    </main>
  );
}
